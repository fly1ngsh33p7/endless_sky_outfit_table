import type { Filters } from '../../FiltersPanel';
import NumericFilter from '../numericFilter/NumericFilter';

interface NumericFiltersProps {
    numericKeys: string[];
    visibleColumns: string[];
    ranges: Record<string, [number, number]>;
    filters: Filters;
    showSliders: boolean;
    onChange: (key: string, range: [number, number]) => void;
    getStep: (min: number, max: number) => number;
}

export default function NumericFilters({
    numericKeys,
    visibleColumns,
    ranges,
    filters,
    showSliders,
    onChange,
    getStep,
}: NumericFiltersProps) {
    return (
        <>
            {numericKeys.map(key => (
                visibleColumns.includes(key) && (
                    <NumericFilter
                        showSlider={showSliders}
                        key={`numeric_filter-${key}`}
                        label={key}
                        range={[ranges[key][0], ranges[key][1]]}
                        value={(filters[key] as [number, number]) || ranges[key]}
                        step={getStep(ranges[key][0], ranges[key][1])}
                        onChange={(val: number[]) =>
                            onChange(key, [val[0], val[1]])
                        }
                    />
                )
            ))}
        </>
    );
}
