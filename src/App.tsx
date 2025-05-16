// App.tsx
import { useState, useEffect, useMemo } from 'react';
import FiltersPanel, { type Filters } from './FiltersPanel';
import EnginesTable from './EnginesTable';

export interface Engine {
	name: string;
	licenses?: string[];
	cost?: number;
	thumbnail?: string;
	mass?: number;
	'outfit space'?: number;
	'engine capacity'?: number;
	turn?: number;
	'turning energy'?: number;
	'turning heat'?: number;
	source?: string;
}

export interface License {
	name: string;
	cost?: number;
}

// Wildcard-Ignorier-Patterns (case-insensitive)
const ignorePatterns = [
	'category',
	'*thumbnail*',
	'*flare*',
	'*flare*effect',
	'*afterburner*effect*',
	'description'
];

// Hilfsfunktion: Pattern → RegExp (mit 'i'-Flag)
const matchesPattern = (key: string, pattern: string) =>
	new RegExp(
		'^' +
		pattern
			.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&')  // Metazeichen escapen
			.replace(/\*/g, '.*')                     // '*' → '.*'
		+ '$',
		'i'
	).test(key);

// Prozessoren für jede Kategorie
function processEngines(raw: any[]): Engine[] {
	// Feld-Transforms nur für Engines
	const engineFieldTransforms: Record<string, (v: any) => any> = {
		'engine capacity': v => typeof v === 'number' ? -v : v,
		'outfit space': v => typeof v === 'number' ? -v : v,
	};

	return raw.map(item => {
		const copy: any = { ...item };

		// a) Ignored keys löschen
		Object.keys(copy).forEach(k => {
			if (ignorePatterns.some(pat => matchesPattern(k, pat))) {
				delete copy[k];
			}
		});

		// b) Transforms anwenden (case-insensitive Lookup)
		Object.entries(engineFieldTransforms).forEach(([field, fn]) => {
			const actualKey = Object.keys(copy)
				.find(k => k.toLowerCase() === field.toLowerCase());
			if (actualKey) {
				copy[actualKey] = fn(copy[actualKey]);
			}
		});

		return copy as Engine;
	});
}

function processLicenses(raw: any[]): License[] {
	// Feld-Transforms nur für Engines
	const engineFieldTransforms: Record<string, (v: any) => any> = {
		'name': v => typeof v === 'string' ? v.replace(" License", "") : v,
	};

	return raw.map(item => {
		const copy: any = { ...item };

		// a) Ignored keys löschen
		Object.keys(copy).forEach(k => {
			if (ignorePatterns.some(pat => matchesPattern(k, pat))) {
				delete copy[k];
			}
		});

		// b) Transforms anwenden (case-insensitive Lookup)
		Object.entries(engineFieldTransforms).forEach(([field, fn]) => {
			const actualKey = Object.keys(copy)
				.find(k => k.toLowerCase() === field.toLowerCase());
			if (actualKey) {
				copy[actualKey] = fn(copy[actualKey]);
			}
		});

		return copy as License;
	});
}

function App() {
	const [engines, setEngines] = useState<Engine[]>([]);
	const [licenses, setLicenses] = useState<License[]>([]);
	const [filters, setFilters] = useState<Filters>({});
	const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

	// 5) Konfiguration: welche JSON-Keys in welchen State wandern
	const categoryConfigs = [
		{
			jsonKey: 'Engines',
			setter: setEngines,
			processor: processEngines,
		},
		{
			jsonKey: 'Licenses',
			setter: setLicenses,
			processor: processLicenses,
		},
		// Weitere Kategorien können hier ergänzt werden
	] as const;

	useEffect(() => {
		fetch('/outfits.json')
			.then(res => res.json())
			.then((all: any) => {
				categoryConfigs.forEach(({ jsonKey, setter, processor }) => {
					const raw: any[] = all[jsonKey] || [];
					setter(processor(raw));
				});
			});
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// Compute all unique keys from engines
	const allKeys = useMemo(() => {
		const set = new Set<string>();
		engines.forEach(e => Object.keys(e).forEach(k => set.add(k)));
		return Array.from(set);
	}, [engines]);

	// Default column order
	const defaultOrder = [
		'name', 'cost', 'mass', 'outfit space', 'engine capacity', 'turn',
		'turning energy', 'turning heat', 'slowing resistance', 'frame rate',
		'steering flare sprite', 'steering flare sound', 'thumbnail', 'source'
	];

	// Only these columns show up by default
	const defaultVisible = [
		'name', 'cost', 'mass', 'outfit space', 'engine capacity',
		'thrust', 'thrusting energy', 'thrusting heat',
		'turn', 'turning energy', 'turning heat',
		'reverse thrust', 'reverse thrusting energy', 'reverse thrusting heat',
	];

	// Initialize visibleColumns once the data loads
	useEffect(() => {
		const initial = defaultVisible.filter(k => allKeys.includes(k));
		setVisibleColumns(initial);
	}, [allKeys]);

	const filteredEngines = useMemo(() => {
		return engines.filter(engine =>
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
	}, [engines, filters]);

	return (
		<div className="flex flex-col md:flex-row h-screen">
			<aside className="w-full md:w-1/4 p-4 overflow-auto border-r">
				<FiltersPanel
					engines={engines}
					licenses={licenses}
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
