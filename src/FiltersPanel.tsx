import React, { useMemo } from 'react';
import type { Engine, License } from './App';
import * as Slider from '@radix-ui/react-slider';
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
        return engines.length > 0
            ? Object.keys(engines[0]).filter(key => typeof (engines[0] as any)[key] === 'number')
            : [];
    }, [engines]);
    
    const stringKeys = useMemo(() => {
        return engines.length > 0
            ? Object.keys(engines[0]).filter(key => typeof (engines[0] as any)[key] === 'string')
            : [];
    }, [engines]);


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
    };

    return (
        <div className="space-y-6">
            <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
            >
                Reset Filters
            </button>

            <div>
                <h3 className="text-sm font-semibold mb-2">Columns</h3>
                <div className="grid grid-cols-2 gap-2">
                    {allKeys.map(key => (
                        <label key={key} className="inline-flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={visibleColumns.includes(key)}
                                onChange={() => toggleColumn(key)}
                            />
                            <span className="text-sm">{key}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold mb-2">Licenses</h3>
                <div className="grid grid-cols-2 gap-2">
                    {licenses
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((license, index) => (
                            <label key={`${license.name}-${index}`} className="inline-flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={selectedLicenses.includes(license.name)}
                                    onChange={() => toggleLicense(license.name)}
                                />
                                <span className="text-sm">{String(license.name)}</span>
                            </label>
                        ))}
                </div>
            </div>

            {numericKeys.map(key => (
                <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">{key}</label>
                    <Slider.Root
                        className="SliderRoot"
                        value={(filters[key] as [number, number]) || ranges[key]}
                        min={ranges[key][0]}
                        max={ranges[key][1]}
                        step={1}
                        onValueChange={(val: number[]) => handleNumericChange(key, [val[0], val[1]])}
                    >
                        <Slider.Track className="SliderTrack">
                            <Slider.Range className="SliderRange" />
                        </Slider.Track>
                        <Slider.Thumb className="SliderThumb" aria-label="Min" />
                        <Slider.Thumb className="SliderThumb" aria-label="Max" />
                    </Slider.Root>
                    <div className="flex space-x-2 mt-1">
                        <input
                            type="number"
                            value={(filters[key] as [number, number])?.[0] || ranges[key][0]}
                            min={ranges[key][0]}
                            max={ranges[key][1]}
                            step={1}
                            onChange={e =>
                                handleNumericChange(key, [
                                    Number(e.target.value),
                                    (filters[key] as [number, number])?.[1] || ranges[key][1],
                                ])
                            }
                            className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring"
                        />
                        <span className="text-gray-600">to</span>
                        <input
                            type="number"
                            value={(filters[key] as [number, number])?.[1] || ranges[key][1]}
                            min={ranges[key][0]}
                            max={ranges[key][1]}
                            step={1}
                            onChange={e =>
                                handleNumericChange(key, [
                                    (filters[key] as [number, number])?.[0] || ranges[key][0],
                                    Number(e.target.value),
                                ])
                            }
                            className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring"
                        />
                    </div>
                </div>
            ))}

            {stringKeys.map(key => (
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
            ))}
        </div>
    );
}
