import React, { useState, useEffect, useMemo } from 'react';
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
    'slowing resistance'?: number;
    'steering flare sprite'?: string;
    'frame rate'?: number;
    'steering flare sound'?: string;
    source?: string;
}

// export interface License {
//     name: string,
// }

function App() {
    const [engines, setEngines] = useState<Engine[]>([]);
    const [filters, setFilters] = useState<Filters>({});
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);


    useEffect(() => {
        fetch('/outfits.json')
            .then(res => res.json())
            .then((all: any) => {
                const raw: any[] = all['Engines'] || [];                  // nur Engines-Block
                const ignorePatterns = [
                    'category',
                    'thumbnail',
                    '*flare*',
                    '*flare*effect',
                    '*afterburner*effect*',
                    'description'
                ];

                // Hilfsfunktion: Wandelt ein Pattern mit '*' in einen Regex um und testet den Key
                const matchesPattern = (key: string, pattern: string) =>
                    new RegExp(                                         // neues Regex
                        '^' +
                        pattern                                         // Pattern escapen
                            .replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&')    // Regex-Metazeichen escapen
                            .replace(/\*/g, '.*')                       // '*' → '.*'
                        + '$'
                    ).test(key);                                        // Test auf Key

                const cleaned = raw.map(item => {                         // für jedes Engine-Objekt
                    const copy: any = { ...item };                        // flache Kopie
                    Object.keys(copy).forEach(key => {                     // alle Keys durchgehen
                        if (ignorePatterns.some(pat => matchesPattern(key, pat))) {
                            delete copy[key];                              // löschen, wenn Pattern passt
                        }
                    });
                    return copy;                                           // bereinigtes Objekt zurück
                });

                setEngines(cleaned as Engine[]);
            })
    }, []);

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

    // Only these columns show up by default (if present in your data)
    const defaultVisible = [
        "name",
        "cost",
        "mass",
        "outfit space",
        "engine capacity",
        "thrust",
        "thrusting energy",
        "thrusting heat",
        "turn",
        "turning energy",
        "turning heat",
        "reverse thrust",
        "reverse thrusting energy",
        "reverse thrusting heat",
    ];

    // Initialize visibleColumns once the data loads
    useEffect(() => {
        // only keep those defaults that actually exist
        const initial = defaultVisible.filter(k => allKeys.includes(k));
        setVisibleColumns(initial);
    }, [allKeys]);

    const filteredEngines = useMemo(() => {
        return engines.filter(engine => {
            return Object.entries(filters).every(([key, value]) => {
                const v = (engine as any)[key];
                if (value == null) return true;
                if (Array.isArray(value) && typeof value[0] === 'number') {
                    // numeric range filter
                    if (typeof v !== 'number') return false;
                    return v >= value[0] && v <= value[1];
                } else if (typeof value === 'string') {
                    if (typeof v !== 'string' && !Array.isArray(v)) return false;
                    const str = Array.isArray(v) ? v.join(', ') : v;
                    return str.toLowerCase().includes(value.toLowerCase());
                }
                return true;
            });
        });
    }, [engines, filters]);

    return (
        <div className="flex flex-col md:flex-row h-screen">
            <aside className="w-full md:w-1/4 p-4 overflow-auto border-r">
                <FiltersPanel
                    engines={engines}
                    filters={filters}
                    setFilters={setFilters}
                    allKeys={allKeys.sort()}
                    visibleColumns={visibleColumns}
                    setVisibleColumns={setVisibleColumns}
                />
            </aside>
            <main className="flex-1 p-4 overflow-auto">
                <EnginesTable engines={filteredEngines} visibleColumns={visibleColumns} />
            </main>
        </div>
    );
}
export default App;