import './CheckboxFilter.css';

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
        <div className="CheckboxFilter">
            <h3 className="CheckboxFilterTitle">{label}</h3>
            <div className="CheckboxFilterOptionsContainer">
                {options.map(option => (
                    <label key={option.value}>
                        <input
                            type="checkbox"
                            checked={option.checked}
                            onChange={() => onToggle(option.value)}
                        />
                        <span className="CheckboxFilterOptionsValue">{option.value}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
