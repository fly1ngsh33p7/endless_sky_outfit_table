import './CheckboxFilter.css';
import { useState } from 'react';

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
    const [filterText, setFilterText] = useState('');

    const filteredOptions = options.filter(option =>
        option.value.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div className="CheckboxFilter">
            <h3 className="CheckboxFilterTitle">{label}</h3>
            <div className="CheckboxFilterInputContainer">
                <label>
                    Filter: {" "}
                    <input
                        type="text"
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                        className="CheckboxFilterInput"
                    />
                </label>
            </div>
            <div className="CheckboxFilterOptionsContainer">
                {filteredOptions.map(option => (
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
