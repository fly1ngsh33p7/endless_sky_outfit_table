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
                const raw: any[] = all['Engines'] || []; // only Engines

                const ignorePatterns = [
                    'category',
                    'thumbnail',
                    '*flare*',
                    '*flare*effect',
                    '*afterburner*effect*',
                    'description'
                ];

                // 1) Wildcard-Pattern → RegExp (mit "i" für case-insensitive)
                const matchesPattern = (key: string, pattern: string) =>
                    new RegExp(
                        '^' +
                        pattern
                            .replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&') // escapen
                            .replace(/\*/g, '.*')                    // * → .*
                        + '$',
                        'i' // <-- hier das i-Flag
                    ).test(key);

                // 2) Feld-Transforms (Schlüssel in Lowercase hinterlegen)
                const FIELD_TRANSFORMS: Record<string, (v: any) => any> = {
                    'engine capacity': v => typeof v === 'number' ? -v : v,
                    'outfit space': v => typeof v === 'number' ? -v : v,
                };

                const cleaned = raw.map(item => {
                    const copy: any = { ...item };

                    // a) Ignored keys löschen (case-insensitive)
                    Object.keys(copy).forEach(key => {
                        if (ignorePatterns.some(pat => matchesPattern(key, pat))) {
                            delete copy[key];
                        }
                    });

                    // b) Transforms anwenden (case-insensitive key lookup)
                    Object.entries(FIELD_TRANSFORMS).forEach(([field, fn]) => {
                        const actualKey = Object.keys(copy)
                            .find(k => k.toLowerCase() === field.toLowerCase());
                        if (actualKey) {
                            try {
                                copy[actualKey] = fn(copy[actualKey]);
                            } catch (err) {
                                console.warn(`Transform error on ${actualKey}:`, err);
                            }
                        }
                    });

                    return copy;
                });

                setEngines(cleaned as Engine[]);
            });
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