interface CheckboxFilterProps {
    label: string;
    options: { value: string; checked: boolean }[];
    onToggle: (value: string) => void;
}

export default function CheckboxFilter({
    label,
    options,
    onToggle
}: CheckboxFilterProps) {
    return (
        <div>
            <h3 className="text-sm font-semibold mb-2">{label}</h3>
            <div className="grid grid-cols-2 gap-2">
                {options.map(option => (
                    <label key={option.value} className="inline-flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={option.checked}
                            onChange={() => onToggle(option.value)}
                        />
                        <span className="text-sm">{option.value}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
