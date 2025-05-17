import type { Engine } from "../../App";
import EnginesTable from "../enginesTable/EnginesTable";
import Panel from "../panel/Panel";

interface ComparisonPanelProps {
    engines: Engine[];
    visibleColumns: string[];
}

export default function ComparisonPanel({
    engines,
    visibleColumns,
}: ComparisonPanelProps) {
    return (
        <Panel heading="Compare">
            { engines.length > 0
                ?   <EnginesTable
                        engines={engines}
                        visibleColumns={visibleColumns}
                    />
                : <p>No outfits added to compare</p>
            }
        </Panel>
    );
}