import React, { useMemo } from 'react';
import * as Engine from "./App"
import * as Slider from '@radix-ui/react-slider';
import './FiltersPanel.css';

export type Filters = {
    [key: string]: [number, number] | string;
};

interface Props {
    engines: typeof Engine[];
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const numericKeys = [
    'cost',
    'mass',
    'outfit space',
    'engine capacity',
    'turn',
    'turning energy',
    'turning heat',
    'slowing resistance',
    'frame rate',
];
const stringKeys = [
    'name',
    'licenses',
    'thumbnail',
    'source',
    'steering flare sprite',
    'steering flare sound',
];

export default function FiltersPanel({ engines, filters, setFilters }: Props) {
    // Compute min/max for numeric fields
    const ranges = useMemo(() => {
        const map: Record<string, [number, number]> = {};
        numericKeys.forEach((key) => {
            const values = engines
                .map((e) => (e as any)[key])
                .filter((v) => typeof v === 'number') as number[];
            map[key] = values.length
                ? [Math.min(...values), Math.max(...values)]
                : [0, 0];
        });
        return map;
    }, [engines]);

    const handleNumericChange = (key: string, range: [number, number]) => {
        setFilters((prev) => ({ ...prev, [key]: range }));
    };
    const handleStringChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };
    const resetFilters = () => setFilters({});

    return (
        <div className="space-y-6">
            <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
            >
                Reset Filters
            </button>

            {/* Numeric Range Filters */}
            {numericKeys.map((key) => (
                <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">{key}</label>
                    <Slider.Root
                        // className="relative flex items-center w-full h-6 mt-1"
                        className="SliderRoot"
                        value={(filters[key] as [number, number]) || ranges[key]}
                        min={ranges[key][0]}
                        max={ranges[key][1]}
                        step={1}
                        onValueChange={(val: number[]) => handleNumericChange(key, [val[0], val[1]])}
                    >
                        <Slider.Track 
                            // className="relative flex-1 h-2 bg-gray-200 rounded"
                            className="SliderTrack"
                            >
                            <Slider.Range 
                                // className="absolute h-full bg-blue-500 rounded" 
                                className="SliderRange"
                                />
                        </Slider.Track>
                        <Slider.Thumb 
                            // className="w-s4 h-4 bg-white border border-gray-400 rounded-full shadow" 
                            className="SliderThumb"
                            aria-label="Volume"
                        />
                        <Slider.Thumb
                            // className="w-4 h-4 bg-white border border-gray-400 rounded-full shadow"
                            className="SliderThumb"
                            aria-label="Volume"
                        />
                    </Slider.Root>
                    <div className="text-xs text-gray-600 mt-1">
                        {(filters[key] as [number, number]) || ranges[key]}
                    </div>
                </div>
            ))}

            {/* String Filters */}
            {stringKeys.map((key) => (
                <div key={key}>
                    <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                        {key}
                    </label>
                    <input
                        id={key}
                        type="text"
                        value={(filters[key] as string) || ''}
                        onChange={(e) => handleStringChange(key, e.target.value)}
                        placeholder={`Filter by ${key}`}
                        className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring"
                    />
                </div>
            ))}
        </div>
    );
}