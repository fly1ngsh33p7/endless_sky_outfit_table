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
            if (categoryToSearchFor && key.toLowerCase() !== categoryToSearchFor.toLowerCase()) return;

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

    /*
        filter the outfits dataStore by presence of field(s)
    */
    const searchOutfitsByFields = (fields: string[]) => {
        // Collect all matching outfits across all categories
        const matchingOutfits: any[] = [];
    
        Object.values(dataStore).forEach((outfits) => {
            // Filter outfits that have all the specified fields (case-insensitive)
            const filteredItems = outfits.filter((item) =>
                fields.every((fieldKey) =>
                    Object.keys(item).some((key) => key.toLowerCase() === fieldKey.toLowerCase())
                )
            );
    
            // Add the matching outfits to the result
            matchingOutfits.push(...filteredItems);
        });
    
        return matchingOutfits;
    };

    useEffect(() => {
        fetch('/outfits.json')
            .then(res => res.json())
            .then((data: dataTypes.DataStore) => {
                // Directly set the dataStore state with the fetched data
                setDataStore(data);

                // if necessary: (suggested by Copilot)
                // // Post-process the "Engines" category 
                // const processedEngines = data["Engines"].map((e: any) => ({
                //     ...e,
                //     'thrust per capacity':
                //         typeof e.thrust === 'number' && typeof e['engine capacity'] === 'number'
                //             ? parseFloat((e.thrust / e['engine capacity']).toFixed(3))
                //             : undefined,
                //     'turn per capacity':
                //         typeof e.turn === 'number' && typeof e['engine capacity'] === 'number'
                //             ? parseFloat((e.turn / e['engine capacity']).toFixed(3))
                //             : undefined,
                //     // Add other computed fields here
                // }));
                // // Update the "Engines" category in the dataStore
                // setDataStore(prev => ({
                //     ...prev,
                //     "Engines": processedEngines,
                // }));
            })
            .catch(err => {
                console.error("Failed to fetch outfits.json:", err);
            });
    }, []);

    const field_names = ["Thrust"];

    return (
        <>
            TemporaryWrapper
            <TabbedPanel 
                initialTabIndex={1}
                tabs={field_names.map(tab_name => ({
                    heading: tab_name,
                    content: <BetterTable data={searchOutfitsByFields([tab_name])} />
                }))}
            />
        </>
    );
}