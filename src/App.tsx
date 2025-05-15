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

function App() {
    const [engines, setEngines] = useState<Engine[]>([]);
    const [filters, setFilters] = useState<Filters>({});
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

    useEffect(() => {
        fetch('/engines.json')
            .then(res => res.json())
            .then((data: Engine[]) => setEngines(data));
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

    // Initialize visible columns once keys change
    useEffect(() => {
        const initial = [
            ...defaultOrder.filter(k => allKeys.includes(k)),
            ...allKeys.filter(k => !defaultOrder.includes(k))
        ];
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
                    allKeys={allKeys}
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