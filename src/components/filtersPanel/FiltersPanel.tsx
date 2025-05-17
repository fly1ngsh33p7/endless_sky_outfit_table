import React, { useMemo } from 'react';
import type { Engine, License } from '../../App';
import CheckboxFilter from '../checkboxFilter/CheckboxFilter';
import NumericFilters from '../numericFilter/NumericFilters';
import './FiltersPanel.css';

export type Filters = { [key: string]: [number, number] | string };

interface Props {
    engines: Engine[];
    licenses: License[];
    selectedLicenses: string[];
    setSelectedLicenses: React.Dispatch<React.SetStateAction<string[]>>;
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    allKeys: string[];
    visibleColumns: string[];
    setVisibleColumns: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function FiltersPanel({
    engines, licenses,
    selectedLicenses, setSelectedLicenses,
    filters, setFilters,
    allKeys, visibleColumns, setVisibleColumns
}: Props) {
    const numericKeys = useMemo(() => {
        return allKeys.filter(key =>
            engines.some(engine => typeof (engine as any)[key] === 'number')
        );
    }, [allKeys, engines]);

    const stringKeys = useMemo(() => {
        return allKeys.filter(key =>
            engines.some(engine => typeof (engine as any)[key] === 'string')
        );
    }, [allKeys, engines]);

    const ranges = useMemo(() => {
        const map: Record<string, [number, number]> = {};
        numericKeys.forEach(key => {
            const vals = engines.map(e => (e as any)[key])
                .filter(v => typeof v === 'number') as number[];
            map[key] = vals.length
                ? [Math.min(...vals), Math.max(...vals)]
                : [0, 0];
        });
        return map;
    }, [engines, numericKeys]);

    const handleNumericChange = (key: string, range: [number, number]) =>
        setFilters(prev => ({ ...prev, [key]: range }));
    const handleStringChange = (key: string, value: string) =>
        setFilters(prev => ({ ...prev, [key]: value }));
    const resetFilters = () => setFilters({});
    const toggleColumn = (key: string) =>
        setVisibleColumns(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );

    const toggleLicense = (name: string) => {
        console.debug("toggled License: ", name)
        setSelectedLicenses(prev =>
            prev.includes(name)
                ? prev.filter(n => n !== name)
                : [...prev, name]
        );
    }

    const getDynamicStep = (min?: number, max?: number) => {
        if (min === undefined || max === undefined) return 1;
        const range = max - min;
        const magnitude = Math.pow(10, Math.floor(Math.log10(range)) - 1);
        return Math.max(1, magnitude);
    };

    return (
        <div className="panel space-y-6">
            <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
            >
                Reset Filters
            </button>
            <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
            >
                Show All
            </button>

            <CheckboxFilter
                label="Columns"
                options={allKeys.map(key => ({
                    value: key,
                    checked: visibleColumns.includes(key)
                }))}
                onToggle={toggleColumn}
            />

            <CheckboxFilter
                label="Licenses"
                options={licenses
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(lic => ({
                        value: lic.name,
                        checked: selectedLicenses.includes(lic.name)
                    }))}
                onToggle={toggleLicense}
            />

            <NumericFilters
                showSliders={false}
                numericKeys={numericKeys}
                visibleColumns={visibleColumns}
                ranges={ranges}
                filters={filters}
                onChange={handleNumericChange}
                getStep={getDynamicStep}
            />

            {stringKeys.map(key => (
                visibleColumns.includes(key) && (
                    <div key={key}>
                        <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                            {key}
                        </label>
                        <input
                            id={key}
                            type="text"
                            value={(filters[key] as string) || ''}
                            onChange={e => handleStringChange(key, e.target.value)}
                            placeholder={`Filter by ${key}`}
                            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring"
                        />
                    </div>
                )
            ))}
        </div>
    );
}
