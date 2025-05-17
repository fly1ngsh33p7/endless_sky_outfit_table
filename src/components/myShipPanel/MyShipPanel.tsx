import { useMemo, useState } from 'react';
import type { Engine } from '../../App';
import EnginesTable from '../enginesTable/EnginesTable';
import Panel from '../panel/Panel';

interface MyShipPanelProps {
    engines: Engine[];
    visibleColumns: string[];
    setEngines: React.Dispatch<React.SetStateAction<Engine[]>>;
    startOpen?: boolean;
    dontTrigger?: boolean;
}

export default function MyShipPanel({
    engines,
    visibleColumns,
    setEngines,
    startOpen,
    dontTrigger = true,
}: MyShipPanelProps) {
    const [otherwiseOccupied, setOtherwiseOccupied] = useState<number>(0);
    const [maxOutfitSpace, setMaxOutfitSpace] = useState<number>(100);

    const currentyOccupiedOutfitSpace = useMemo(() => {
        // sum the engines, add otherwiseOccupied outfit space
        return engines.reduce((total, engine) => total + (engine['outfit space'] || 0), otherwiseOccupied);
    }, [otherwiseOccupied]);

    const getDynamicStep = (value: number) => {
        if (!value || value < 10) return 1;
        return Math.pow(10, Math.floor(Math.log10(value)));
    };

    // const handleNumericChange = (key: string, range: [number, number]) =>
    //     setFilters(prev => ({ ...prev, [key]: range }));

    const resetShip = () => {
        setOtherwiseOccupied(0);
        setMaxOutfitSpace(100);
        setEngines([]);
    }

    return (
        <Panel heading={"MyShip"} startOpen={startOpen} trigger={engines} dontTrigger={dontTrigger}>
            <label className="space-x-2 mt-2 ml-2">
                <button
                    onClick={resetShip}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
                >
                    Reset Ship
                </button>
            </label>

            {engines.length > 0 
                ?  <EnginesTable engines={engines} visibleColumns={visibleColumns} />
                : <p>No Engines added</p>
            }

            <label className="space-x-2">
                <span>Outfit Space:</span>
                <input
                    type="number"
                    value={currentyOccupiedOutfitSpace}
                    disabled
                    className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring"
                />
                <span>of</span>
                <input
                    type="number"
                    value={maxOutfitSpace}
                    min={0}
                    step={getDynamicStep(maxOutfitSpace)}
                    onChange={e => setMaxOutfitSpace(Number(e.target.value))}
                    className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring"
                />
            </label>

            <label className="space-x-2 mt-2">
                <span>Otherwise occupied:</span>
                <input
                    type="number"
                    value={otherwiseOccupied}
                    min={0}
                    max={maxOutfitSpace}
                    step={getDynamicStep(otherwiseOccupied)}
                    onChange={e => setOtherwiseOccupied(Number(e.target.value))}
                    className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring"
                />
            </label>
        </Panel>
    );
}
