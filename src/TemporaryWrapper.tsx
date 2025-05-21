import { useEffect, useState } from "react";
import BetterTable from "./components/betterTable/BetterTable";
import TabbedPanel from "./components/panel/TabbedPanel";
import * as dataTypes from './DataTypes';

export interface TemporaryWrapperProps {

};




export default function TemporaryWrapper({}: TemporaryWrapperProps) {
    /* 
        looks like 
        {
            "Secondary Weapons": [{ "name": "Accurate Gatling Blaster" }, ...],
            "Guns": [],
            "Turrets": [],
            "Engines": [],
            ...
        }

        access:
        const secondaryWeapons = dataStore["Secondary Weapons"];
        const engines = dataStore["Engines"];

    */
    const [dataStore, setDataStore] = useState<dataTypes.DataStore>({
        "Secondary Weapons": [],
        "Guns": [],
        "Turrets": [],
        "Systems": [],
        "Engines": [],
        "Hand to Hand": [],
        "Power": [],
        "Ammunition": [],
        "Licenses": [],
        "Special": [],
        "Unique": [],
        "Powers": [],
        "Minerals": [],
        "Production": [],
        "Hidden": [],
    });

    // FIXME: is this necessary?
    // const addItemToCategory = (category: keyof dataTypes.DataStore, newItem: any) => {
    //     setDataStore((previousState) => ({
    //         ...previousState,
    //         [category]: [...previousState[category], newItem],
    //     }));
    // };

    const searchOutfits = (query: string, categoryToSearchFor?: keyof dataTypes.DataStore) => {
        const results: { category: keyof dataTypes.DataStore; outfits: any[] }[] = [];
    
        Object.entries(dataStore).forEach(([key, outfits]) => {
            /* 
                state dataStore: {"Secondary Weapons": [], "Guns": [], ...}
                So if categoryToSearchFor is supplied (can only be of type "key of dataTypes.DataStore)
                then the key of the array ("Secondary Weapons", ...) is relevant: only "use" outfits of the correct category 
            */
            if (categoryToSearchFor && key !== categoryToSearchFor) return;

            // filter outfits of this category
            const filteredItems = outfits.filter((item) =>
                item.name.toLowerCase().includes(query.toLowerCase())
            );

            // add outfits with matching query (and category) to result, grouped by category
            if (filteredItems.length > 0) {
                results.push({ category: key as keyof dataTypes.DataStore, outfits: filteredItems });
            }
        });
    
        return results;
    };

    useEffect(() => {
        fetch('/outfits.json')
            .then(res => res.json())
            .then((all: any) => {
                // 1) Licenses erzeugen und in State
                const rawLic = all['Licenses'] || [];
                const licObjs = processLicenses(rawLic);
                setLicenses(licObjs);

                // 2) Engines parsen
                const rawEng = all['Engines'] || [];
                const processed = processEngines(rawEng);

                // 3) Lizenz-Namen → echte Objekte
                const mapped: Engine[] = processed.map((e: any) => {
                    const names: string[] = Array.isArray(e.licenses)
                        ? e.licenses.map((lic: any) => (typeof lic === 'string' ? lic : lic.name))
                        : typeof e.licenses === 'string'
                            ? [e.licenses]
                            : [];

                    const licArray = names
                        .flatMap(n => licObjs.filter(l => l.name === n));

                    return { ...e, licenses: licArray };
                });

                // 4) berechnete Felder ergänzen
                const withComputed = mapped.map(e => ({
                    ...e,
                    'thrust per capacity':
                        typeof e.thrust === 'number' && typeof e['engine capacity'] === 'number'
                            ? parseFloat((e.thrust / e['engine capacity']).toFixed(3))
                            : undefined,
                    'turn per capacity':
                        typeof e.turn === 'number' && typeof e['engine capacity'] === 'number'
                            ? parseFloat((e.turn / e['engine capacity']).toFixed(3))
                            : undefined,
                    'reverse thrust per capacity':
                        typeof e['reverse thrust'] === 'number' && typeof e['engine capacity'] === 'number'
                            ? parseFloat((e['reverse thrust'] / e['engine capacity']).toFixed(3))
                            : undefined,
                    'thrust+turn per capacity':
                        typeof e['engine capacity'] === 'number'
                            ? parseFloat(
                                (
                                    ((e.thrust || 0) + (e.turn || 0)) /
                                    e['engine capacity']
                                ).toFixed(3)
                            )
                            : undefined,
                    'energy per combined thrust':
                        typeof e['engine capacity'] === 'number'
                            ? parseFloat(
                                (
                                    ((e['turning energy'] || 0) + (e['thrusting energy'] || 0)) /
                                    ((e.thrust || 0) + (e.turn || 0) || 1)
                                ).toFixed(6)
                            )
                            : undefined,
                }));

                setEngines(withComputed);

            });
    }, []);


    return (
        <>
            TemporaryWrapper
            <TabbedPanel initialTabIndex={1}
                tabs={[
                    {heading: "Engines", content: <BetterTable data={[]} />},
                    {heading: "Energy Capacity", content: <>Energy Capacity Table</>},
                    {heading: "Energy Generation", content: <>Energy Generation Table</>},
                ]}
            />
        </>
    );
}