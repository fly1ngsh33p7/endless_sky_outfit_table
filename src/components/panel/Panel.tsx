import React, { useEffect, useState } from 'react';
import './Panel.css';

interface PanelProps {
    heading?: string;
    children: React.ReactNode;
    className?: PanelClassNames;
    startOpen?: boolean;
    trigger?: unknown;
    dontTrigger?: boolean;
    alwaysOpen?: boolean;
}

export interface PanelClassNames {
    panel?: string;
    panelHeading?: string;
    panelTitle?: string;
    panelContent?: string;
}

export default function Panel({ heading, children, startOpen = true, trigger, dontTrigger = true, className, alwaysOpen = false }: PanelProps) {
    const [isOpen, setIsOpen] = useState(startOpen || alwaysOpen);

    const togglePanel = () => {
        console.log("toggledPanel to " + (!isOpen ? 'open' : 'closed'))
        setIsOpen(!isOpen);
    }

    useEffect(() => {
        // FIXME: might disregard startOpen = false
        if (!dontTrigger && trigger !== undefined) {
            setIsOpen(true);
        }
    }, [trigger]);

    return (
        <div className={className?.panel ?? "panel"}>
            {heading &&
                <div className={className?.panelHeading ?? "panel-heading"} onClick={alwaysOpen ? () => {} : togglePanel} title={(isOpen && !alwaysOpen) ? 'Einklappen' : 'Ausklappen'}>
                    {!alwaysOpen &&
                        <span className={`panel-toggle chevron ${isOpen ? 'chevron-up' : 'chevron-down'}`} />
                    }
                    <h3 className={className?.panelTitle ?? "panel-title"}>{heading}</h3>
                </div>
            }
            {isOpen && <div className={className?.panelContent ?? "panel-content"}>{children}</div>}
        </div>
    );
}