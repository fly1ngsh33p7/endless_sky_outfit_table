import type { Engine } from "../../App";
import EnginesTable from "../enginesTable/EnginesTable";
import Panel from "../panel/Panel";

interface ComparisonPanelProps {
    engines: Engine[];
    visibleColumns: string[];
    startOpen?: boolean;
}

export default function ComparisonPanel({
    engines,
    visibleColumns,
    startOpen,
}: ComparisonPanelProps) {
    return (
        <Panel heading="Compare" startOpen={startOpen}>
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