import React, { useState, useEffect, useMemo } from 'react';
import FiltersPanel, { type Filters } from './FiltersPanel';
import EnginesTable from './EnginesTable';

export interface Engine {
	name: string;
	licenses?: string[] | string;
	cost?: number;
	mass?: number;
	'outfit space'?: number;
	'engine capacity'?: number;
	thrust?: number;
	turn?: number;
	'reverse thrust'?: number;
	'turning energy'?: number;
	'turning heat'?: number;
	'thrust+turn per capacity'?: number;
	'energy per combined thrust'?: number;
	'thrust per capacity'?: number;
	'thrusting energy'?: number,
	'turn per capacity'?: number;
	'reverse thrust per capacity'?: number;
}

export interface License {
	name: string;
	cost?: number;
}

// --- Hilfs-Konstanten + Post-Processing ---
const ignorePatterns = [
	'category', 'thumbnail', '*flare*', '*afterburner*effect*', 'description', 'unplunderable',
];
const matchesPattern = (key: string, pattern: string) =>
	new RegExp(
		'^' +
		pattern.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*') +
		'$', 'i'
	).test(key);

const engineFieldTransforms: Record<string, (v: any) => any> = {
	'engine capacity': v => typeof v === 'number' ? -v : v,
	'outfit space': v => typeof v === 'number' ? -v : v,
};

function processEngines(raw: any[]): Omit<Engine, 'thrust per capacity' | 'turn per capacity' | 'reverse thrust per capacity' | 'thrust+turn per capacity' | 'energy per combined thrust'>[] {
	return raw.map(item => {
		const copy: any = { ...item };
		Object.keys(copy).forEach(k => {
			if (ignorePatterns.some(p => matchesPattern(k, p))) delete copy[k];
		});
		Object.entries(engineFieldTransforms).forEach(([f, fn]) => {
			const act = Object.keys(copy).find(k => k.toLowerCase() === f.toLowerCase());
			if (act) copy[act] = fn(copy[act]);
		});
		return copy;
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
				const rawEng = all['Engines'] || [];
				// 1) Process engines, 2) compute thrust per capacity, 3) set state
				const processed = processEngines(rawEng);
				const withComputed: Engine[] = processed.map(e => ({
					...e,
					'thrust per capacity':
						typeof e.thrust === 'number' && typeof e['engine capacity'] === 'number'
							? parseFloat((e.thrust / e['engine capacity']).toFixed(3))
							: undefined,
					'turn per capacity':
						typeof e.turn === 'number' && typeof e['engine capacity'] === 'number'
							? parseFloat((e.turn / e['engine capacity']).toFixed(3))
							: undefined,
					'reverse thrust per capacity':
						typeof e['reverse thrust'] === 'number' && typeof e['engine capacity'] === 'number'
							? parseFloat((e['reverse thrust'] / e['engine capacity']).toFixed(3))
							: undefined,
					'thrust+turn per capacity':
						typeof e['engine capacity'] === 'number' &&
							(e.thrust || e.turn)
								? parseFloat(
										(((e.thrust || 0) + (e.turn || 0)) / e['engine capacity']).toFixed(3)
								)
								: undefined,
					'energy per combined thrust':
						typeof e['engine capacity'] === 'number' &&
						(e['thrusting energy'] || e['turning energy']) &&
							(e.thrust || e.turn)
								? parseFloat(
										(
											((e['turning energy'] || 0) + (e['thrusting energy'] || 0)) /
											((e.thrust || 0) + (e.turn || 0))
										).toFixed(3)
								)
								: undefined,
				}));
				setEngines(withComputed);

				const rawLic = all['Licenses'] || [];
				setLicenses(processLicenses(rawLic));
			});
	}, []);

	// --- Alle Spalten aus den Engines auslesen ---
	const allKeys = useMemo(() => {
		const s = new Set<string>();
		engines.forEach(e => Object.keys(e).forEach(k => s.add(k)));
		return Array.from(s);
	}, [engines]);

	const filteredEngines = useMemo(() => {
		return engines
			.filter(e => {
				if (selectedLicenses.length === 0) return true;
				const lic = e.licenses;
				if (Array.isArray(lic)) return lic.some(l => selectedLicenses.includes(l));
				if (typeof lic === 'string') return selectedLicenses.includes(lic);
				return false;
			})
			.filter(e =>
				Object.entries(filters).every(([key, value]) => {
					const v = (e as any)[key];
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
			'name', 'cost', 'mass', 
			// 'outfit space', 
			'engine capacity', 'thrust+turn per capacity',
			'thrust per capacity', 'turn per capacity', 'reverse thrust per capacity',//'thrust', 'turn', 'reverse thrust', 
			'energy per combined thrust',
			'licenses',
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
				/>
			</main>
		</div>
	);
}

export default App;
