import React, { useMemo } from 'react';
import { Engine } from './App';
import { Slider } from '@radix-ui/react-slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type Filters = {
    [key: string]: [number, number] | string;
};

interface Props {
    engines: Engine[];
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const numericKeys = [
    'cost', 'mass', 'outfit space', 'engine capacity',
    'turn', 'turning energy', 'turning heat', 'slowing resistance', 'frame rate'
];
const stringKeys = [
    'name', 'licenses', 'thumbnail', 'source',
    'steering flare sprite', 'steering flare sound'
];

export default function FiltersPanel({ engines, filters, setFilters }: Props) {
    const ranges = useMemo(() => {
        const map: Record<string, [number, number]> = {};
        numericKeys.forEach(key => {
            const values = engines
                .map(e => (e as any)[key])
                .filter(v => typeof v === 'number') as number[];
            map[key] = values.length
                ? [Math.min(...values), Math.max(...values)]
                : [0, 0];
        });
        return map;
    }, [engines]);

    const handleNumericChange = (key: string, range: [number, number]) => {
        setFilters(prev => ({ ...prev, [key]: range }));
    };
    const handleStringChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    const reset = () => setFilters({});

    return (
        <div className="space-y-6">
            <Button onClick={reset} variant="outline">Reset Filters</Button>

            {numericKeys.map(key => (
                <div key={key}>
                    <Label>{key}</Label>
                    <Slider.Root
                        className="relative flex items-center w-full h-6"
                        defaultValue={ranges[key]}
                        value={(filters[key] as [number, number]) || ranges[key]}
                        min={ranges[key][0]}
                        max={ranges[key][1]}
                        step={1}
                        onValueChange={(val) => handleNumericChange(key, [val[0], val[1]])}
                    >
                        <Slider.Track className="relative flex-1 h-2 bg-gray-200 rounded">
                            <Slider.Range className="absolute h-full bg-blue-500 rounded" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-4 h-4 bg-white border rounded-full shadow" />
                        <Slider.Thumb className="block w-4 h-4 bg-white border rounded-full shadow" />
                    </Slider.Root>
                    <div className="text-sm text-gray-600">{(filters[key] as [number, number] || ranges[key]).join(' - ')}</div>
                </div>
            ))}

            {stringKeys.map(key => (
                <div key={key}>
                    <Label htmlFor={key}>{key}</Label>
                    <Input
                        id={key}
                        value={(filters[key] as string) || ''}
                        onChange={e => handleStringChange(key, e.target.value)}
                        placeholder={`Filter by ${key}`}
                    />
                </div>
            ))}
        </div>
    );
}