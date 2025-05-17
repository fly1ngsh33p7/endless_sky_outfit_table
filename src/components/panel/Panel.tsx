import React, { useEffect, useState } from 'react';
import './Panel.css';

interface PanelProps {
    heading: string;
    children: React.ReactNode;
    startOpen?: boolean;
    trigger?: unknown;
    dontTrigger?: boolean;
}

export default function Panel({ heading, children, startOpen = true, trigger, dontTrigger = true }: PanelProps) {
    const [isOpen, setIsOpen] = useState(startOpen);

    const togglePanel = () => setIsOpen(!isOpen);

    useEffect(() => {
        // FIXME: might disregard startOpen = false
        if (!dontTrigger && trigger !== undefined) {
            setIsOpen(true);
        }
    }, [trigger]);

    return (
        <div className="panel">
            <div className="panel-heading" onClick={togglePanel} title={isOpen ? 'Einklappen' : 'Ausklappen'}>
                <span className={`panel-toggle chevron ${isOpen ? 'chevron-up' : 'chevron-down'}`} />
                <h3 className="panel-title">{heading}</h3>
            </div>
            {isOpen && <div className="panel-content">{children}</div>}
        </div>
    );
}