import * as Slider from '@radix-ui/react-slider';
import './NumericFilter.css';

interface NumericFilterProps {
    label: string;
    range: [number, number];
    value: [number, number];
    step: number;
    showSlider: boolean;
    onChange: (newRange: [number, number]) => void;
}

export default function NumericFilter({
    label,
    range,
    value,
    step,
    showSlider,
    onChange,
}: NumericFilterProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            { showSlider &&
                <Slider.Root
                    className="SliderRoot"
                    value={value}
                    min={range[0]}
                    max={range[1]}
                    step={step}
                    onValueChange={(val: number[]) => onChange([val[0], val[1]])}
                >
                    <Slider.Track className="SliderTrack">
                        <Slider.Range className="SliderRange" />
                    </Slider.Track>
                    <Slider.Thumb className="SliderThumb" aria-label="Min" />
                    <Slider.Thumb className="SliderThumb" aria-label="Max" />
                </Slider.Root>
            }
            <div className="flex space-x-2 mt-1">
                <input
                    type="number"
                    value={value[0]}
                    min={range[0]}
                    max={range[1]}
                    step={step}
                    onChange={e => onChange([Number(e.target.value), value[1]])}
                    className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring"
                />
                <span className="text-gray-600">to</span>
                <input
                    type="number"
                    value={value[1]}
                    min={range[0]}
                    max={range[1]}
                    step={step}
                    onChange={e => onChange([value[0], Number(e.target.value)])}
                    className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring"
                />
            </div>
        </div>
    );
}
