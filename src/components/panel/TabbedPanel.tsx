import { useState, type ReactElement } from "react";
import Panel, { type PanelClassNames } from "./Panel";
import './TabbedPanel.css';

interface TabbedPanelProps {
    heading?: string;
    initialTabIndex?: number;
    tabs: Array<{
        heading: string;
        content: ReactElement;
    }>;
}

export default function TabbedPanel({
    heading,
    initialTabIndex = 0,
    tabs,
}: TabbedPanelProps) {
    const [currentTabIndex, setCurrentTabIndex] = useState<number>(initialTabIndex < tabs.length && initialTabIndex >= 0 ? initialTabIndex : 0 );

    const overridePanelClassNames: PanelClassNames = {
        panel: "TabbedPanel",
        panelHeading: "TabbedPanelHeading",
        panelTitle: undefined,
        panelContent: "",
    } 

    return (
        <Panel heading={heading} className={overridePanelClassNames} alwaysOpen>
            <div className="TabbedPanelHeader">
                {/* Hier irgendwie mit Flex den ganzen Platz einnehmen:*/}
                {/* einen Div pro "Tab" */}
                {tabs.map((tabContent, index) => (
                    <div
                        key={index}
                        className={`TabButton ${index === currentTabIndex ? "active" : ""}`}
                        onClick={() => setCurrentTabIndex(index)}
                    >
                        {tabContent.heading}
                    </div>
                ))}
            </div>
            <div className="TabbedPanelBody">
                <Panel className={{panel: "", panelContent: "", panelHeading: "", panelTitle: undefined}} alwaysOpen>
                    {tabs[currentTabIndex].content}
                </Panel>
            </div>
        </Panel>
    );
}