import React, { useState, useEffect, useMemo } from 'react';
import FiltersPanel, { type Filters } from './components/filtersPanel/FiltersPanel';
import EnginesTable from './components/enginesTable/EnginesTable';
import ComparisonPanel from './components/comparisonPanel/ComparisonPanel';
import MyShipPanel from './components/myShipPanel/MyShipPanel';
import * as dataTypes from './DataTypes';
import TemporaryWrapper from './TemporaryWrapper';


export interface Engine {
	name: string;
	licenses: dataTypes.License[];
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

// --- Hilfs-Konstanten + Post-Processing ---
const ignorePatterns = [
	'category', '*thumbnail*', '*flare*', '*afterburner*effect*', '*description*',
	'unplunderable', 'display name',
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
	name: v => (typeof v === 'string' ? v.replace(/ dataTypes.License$/, '') : v),
};

function processLicenses(raw: any[]): dataTypes.License[] {
	return raw.reduce((acc: dataTypes.License[], item) => {
		const copy: any = { ...item };
		Object.keys(copy).forEach(k => {
			if (ignorePatterns.some(p => matchesPattern(k, p))) delete copy[k];
		});
		Object.entries(licenseFieldTransforms).forEach(([f, fn]) => {
			const act = Object.keys(copy).find(k => k.toLowerCase() === f.toLowerCase());
			if (act) copy[act] = fn(copy[act]);
		});
		if (!acc.some(l => l.name === copy.name)) acc.push(copy as dataTypes.License);
		return acc;
	}, []);
}

function App() {
	const [engines, setEngines] = useState<Engine[]>([]);
	const [myShipEngines, setMyShipEngines] = useState<Engine[]>([]);
	const [licenses, setLicenses] = useState<dataTypes.License[]>([]);
	const [relevantLicenses, setRelevantLicenses] = useState<dataTypes.License[]>([]);
	const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
	const [filters, setFilters] = useState<Filters>({});
	const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
	const [enginesToCompare, setEnginesToCompare] = useState<Engine[]>([]);

	// --- Daten laden + in echte License-Objekte umwandeln + in Engines mappen ---
	useEffect(() => {
		fetch('/outfits.json')
			.then(res => res.json())
			.then((all: any) => {
				// 1) Licenses erzeugen und in State
				const rawLic = all['Licenses'] || [];
				const licObjs = processLicenses(rawLic);
				setLicenses(licObjs);

				// 2) Engines parsen
				const rawEng = all['Engines'] || [];
				const processed = processEngines(rawEng);

				// 3) Lizenz-Namen → echte Objekte
				const mapped: Engine[] = processed.map((e: any) => {
					const names: string[] = Array.isArray(e.licenses)
						? e.licenses.map((lic: any) => (typeof lic === 'string' ? lic : lic.name))
						: typeof e.licenses === 'string'
							? [e.licenses]
							: [];

					const licArray = names
						.flatMap(n => licObjs.filter(l => l.name === n));

					return { ...e, licenses: licArray };
				});

				// 4) berechnete Felder ergänzen
				const withComputed = mapped.map(e => ({
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
						typeof e['engine capacity'] === 'number'
							? parseFloat(
								(
									((e.thrust || 0) + (e.turn || 0)) /
									e['engine capacity']
								).toFixed(3)
							)
							: undefined,
					'energy per combined thrust':
						typeof e['engine capacity'] === 'number'
							? parseFloat(
								(
									((e['turning energy'] || 0) + (e['thrusting energy'] || 0)) /
									((e.thrust || 0) + (e.turn || 0) || 1)
								).toFixed(6)
							)
							: undefined,
				}));

				setEngines(withComputed);


				// Relevante Lizenzen setzen
				const relevant = licObjs.filter(license =>
					mapped.some(engine => engine.licenses.some(l => l.name === license.name))
				);
				setRelevantLicenses(relevant);
			});
	}, []);

	// --- Spaltenliste ermitteln ---
	const allKeys = useMemo(() => {
		const s = new Set<string>();
		engines.forEach(e => Object.keys(e).forEach(k => s.add(k)));
		return Array.from(s);
	}, [engines]);

	// --- Filter & Lizenz-Filter ---
	const filteredEngines = useMemo(() => {
		return engines
			.filter(e => {
				if (selectedLicenses.length === 0) return true;
				return e.licenses.some(l => selectedLicenses.includes(l.name));
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

	// --- sichtbare Spalten initialisieren ---
	useEffect(() => {
		const defaults = [
			'name', 'cost', 'mass', 'engine capacity', 'thrust+turn per capacity', 'energy per combined thrust', 'thrust',
			'turn', 'reverse thrust', 'thrust per capacity', 'turn per capacity',
			'reverse thrust per capacity',  'licenses',
		];
		setVisibleColumns(defaults.filter(k => allKeys.includes(k)));
	}, [allKeys]);

	return (
		<div className="app flex flex-col md:flex-row h-screen">
			<TemporaryWrapper /> {/* wrap everything for the new BetterTable to not mix states */}
			<aside className="w-full md:w-1/4 p-4 overflow-auto border-r">
				<FiltersPanel
					engines={engines}
					licenses={relevantLicenses}
					selectedLicenses={selectedLicenses}
					setSelectedLicenses={setSelectedLicenses}
					filters={filters}
					setFilters={setFilters}
					allKeys={allKeys.sort()}
					visibleColumns={visibleColumns}
					setVisibleColumns={setVisibleColumns}
					startOpen={false}
				/>

				<MyShipPanel engines={myShipEngines} setEngines={setMyShipEngines} visibleColumns={visibleColumns} startOpen={false} dontTrigger/>

				<ComparisonPanel 
					engines={enginesToCompare}
					visibleColumns={visibleColumns}
					startOpen={false}
				/>
			</aside>
			<main className="flex-1 p-4 overflow-auto">
				<EnginesTable
					engines={filteredEngines}
					visibleColumns={visibleColumns}
					enginesToCompare={enginesToCompare}
					setEnginesToCompare={setEnginesToCompare}
					myShipEngines={myShipEngines}
					setMyShipEngines={setMyShipEngines}
				/>
			</main>
		</div>
	);
}

export default App;
