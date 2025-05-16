import React, { useState, useEffect, useMemo } from 'react';
import FiltersPanel, { type Filters } from './FiltersPanel';
import EnginesTable from './EnginesTable';

export interface Engine {
	name: string;
	licenses?: string[] | string;
	cost?: number;
	thumbnail?: string;
	mass?: number;
	'outfit space'?: number;
	'engine capacity'?: number;
	turn?: number;
	'turning energy'?: number;
	'turning heat'?: number;
}

export interface License {
	name: string;
	cost?: number;
}

// --- Hilfs-Konstanten und -Funktionen für das Post-Processing ---
const ignorePatterns = [
	'category', 'thumbnail', '*flare*', '*afterburner*effect*', 'description', 'unplunderable',
];

const matchesPattern = (key: string, pattern: string) =>
	new RegExp(
		'^' +
		pattern.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*') +
		'$',
		'i'
	).test(key);

const engineFieldTransforms: Record<string, (v: any) => any> = {
	'engine capacity': v => typeof v === 'number' ? -v : v,
	'outfit space': v => typeof v === 'number' ? -v : v,
};

function processEngines(raw: any[]): Engine[] {
	return raw.map(item => {
		const copy: any = { ...item };
		// a) Ignored keys entfernen
		Object.keys(copy).forEach(k => {
			if (ignorePatterns.some(p => matchesPattern(k, p))) {
				delete copy[k];
			}
		});
		// b) Feld-Transforms
		Object.entries(engineFieldTransforms).forEach(([f, fn]) => {
			const act = Object.keys(copy)
				.find(k => k.toLowerCase() === f.toLowerCase());
			if (act) copy[act] = fn(copy[act]);
		});
		return copy as Engine;
	});
}

const licenseFieldTransforms: Record<string, (v: any) => any> = {
	name: v => typeof v === 'string' ? v.replace(/ License$/, '') : v
};

function processLicenses(raw: any[]): License[] {
	return raw.reduce((acc: License[], item) => {
		const copy: any = { ...item };

		Object.keys(copy).forEach(k => {
			if (ignorePatterns.some(p => matchesPattern(k, p))) {
				delete copy[k];
			}
		});

		Object.entries(licenseFieldTransforms).forEach(([f, fn]) => {
			const act = Object.keys(copy)
				.find(k => k.toLowerCase() === f.toLowerCase());
			if (act) copy[act] = fn(copy[act]);
		});

		//dont add a License that has a name that is already present
		if (!acc.some(license => license.name === copy.name)) {
			acc.push(copy as License);
		}
		return acc;
	}, []);
}

function App() {
	const [engines, setEngines] = useState<Engine[]>([]);
	const [licenses, setLicenses] = useState<License[]>([]);
	const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
	const [filters, setFilters] = useState<Filters>({});
	const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

	// --- Daten laden und vorverarbeiten ---
	useEffect(() => {
		fetch('/outfits.json')
			.then(res => res.json())
			.then((all: any) => {
				const rawEngines: any[] = all['Engines'] || [];
				setEngines(processEngines(rawEngines));

				const rawLicenses: any[] = all['Licenses'] || [];
				setLicenses(processLicenses(rawLicenses));
			});
	}, []);

	// --- Alle Spalten aus den Engines auslesen ---
	const allKeys = useMemo(() => {
		const s = new Set<string>();
		engines.forEach(e => Object.keys(e).forEach(k => s.add(k)));
		return Array.from(s);
	}, [engines]);

	// ---- Filtered Engines (inkl. Lizenz-Filter) ----
	const filteredEngines = useMemo(() => {
		return engines.filter(engine => {
				if (selectedLicenses.length === 0) {
					return true;
				}
				const lic = engine.licenses;
				if (Array.isArray(lic)) {
					// falls licenses ein Array ist
					return lic.some(l => selectedLicenses.includes(l));
				}
				if (typeof lic === 'string') {
					// falls nur ein String
					return selectedLicenses.includes(lic);
				}
				// kein licenses-Feld → ausschließen
				return false;
			})
			// dann alle anderen Filter
			.filter(engine =>
				Object.entries(filters).every(([key, value]) => {
					const v = (engine as any)[key];
					if (value == null) return true;
					if (Array.isArray(value) && typeof value[0] === 'number') {
						if (typeof v !== 'number') return false;
						return v >= value[0] && v <= value[1];
					} else if (typeof value === 'string') {
						if (typeof v !== 'string' && !Array.isArray(v)) return false;
						const str = Array.isArray(v) ? v.join(', ') : v;
						return str.toLowerCase().includes(value.toLowerCase());
					}
					return true;
				})
			);
	}, [engines, filters, selectedLicenses]);

	// --- Sichtbare Spalten initial füllen ---
	useEffect(() => {
		const defaults = [
			'name', 'cost', 'mass', 'outfit space', 'engine capacity',
			'turn', 'turning energy', 'turning heat', 'slowing resistance'
		];
		setVisibleColumns(defaults.filter(k => allKeys.includes(k)));
	}, [allKeys]);

	// Debug
	useEffect(() => {
		console.log(filteredEngines);
		console.log(licenses);
	}, [filteredEngines, licenses]);

	return (
		<div className="flex flex-col md:flex-row h-screen">
			<aside className="w-full md:w-1/4 p-4 overflow-auto border-r">
				<FiltersPanel
					engines={engines}
					licenses={licenses}
					selectedLicenses={selectedLicenses}
					setSelectedLicenses={setSelectedLicenses}
					filters={filters}
					setFilters={setFilters}
					allKeys={allKeys.sort()}
					visibleColumns={visibleColumns}
					setVisibleColumns={setVisibleColumns}
				/>
			</aside>
			<main className="flex-1 p-4 overflow-auto">
				<EnginesTable
					engines={filteredEngines}
					visibleColumns={visibleColumns}
					selectedLicenses={selectedLicenses}
				/>
			</main>
		</div>
	);
}

export default App;
