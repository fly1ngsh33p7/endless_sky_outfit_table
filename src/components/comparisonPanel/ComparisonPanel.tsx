import type { Engine } from "../../App";
import EnginesTable from "../../EnginesTable";
import './ComparisonPanel.css';

interface ComparisonPanelProps {
    engines: Engine[];
    visibleColumns: string[];
}

export default function ComparisonPanel({
    engines,
    visibleColumns,
}: ComparisonPanelProps) {
    return (
        <div className="panel">
            ComparisonPanel
            { engines.length > 0
                ?   <EnginesTable
                        engines={engines}
                        visibleColumns={visibleColumns}
                    />
                : <p>No outfits added to compare</p>
            }
        </div>
    );
}