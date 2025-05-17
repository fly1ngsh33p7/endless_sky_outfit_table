import type { Engine } from "../../App";
import EnginesTable from "../../EnginesTable";

interface ComparisonPanelProps {
    engines: Engine[];
    visibleColumns: string[];
}

export default function ComparisonPanel({
    engines,
    visibleColumns,
}: ComparisonPanelProps) {
    return (
        <div>
            ComparisonPanel
            { engines.length > 0 && 
                <EnginesTable
                    engines={engines}
                    visibleColumns={visibleColumns}
                />
            }
        </div>
    );
}