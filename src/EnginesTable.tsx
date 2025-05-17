import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    type ColumnDef,
    type SortingState,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import type { Engine, License } from './App';
import './EnginesTable.css';

export interface EnginesTableProps {
    engines: Engine[];
    visibleColumns: string[];
    enginesToCompare?: Engine[];
    myShipEngines?: Engine[];
    setEnginesToCompare?: React.Dispatch<React.SetStateAction<Engine[]>>;
    setMyShipEngines?: React.Dispatch<React.SetStateAction<Engine[]>>;
}

// Hilfsfunktion: Schlüssel in Titel-Format umwandeln
const toHeader = (key: string) =>
    key
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

export default function EnginesTable({
    engines,
    visibleColumns,
    enginesToCompare,
    myShipEngines,
    setEnginesToCompare,
    setMyShipEngines,
}: EnginesTableProps) {
    // Ermittelt, welche Spalten numerisch sind
    const numericColumns = useMemo<Set<string>>(() => {
        const set = new Set<string>();
        visibleColumns.forEach(key => {
            if (engines.some(row => typeof (row as any)[key] === 'number')) {
                set.add(key);
            }
        });
        return set;
    }, [visibleColumns, engines]);

    // Spalten-Definition inkl. optionaler Select-Spalte
    const columns = useMemo<ColumnDef<Engine>[]>(() => {
        // Basis-Spalten
        const baseCols = visibleColumns.map(key => {
            const isNumeric = numericColumns.has(key);
            return {
                accessorKey: key,
                header: () => <span>{toHeader(key)}</span>,
                sortingFn: isNumeric
                    ? (rowA, rowB, columnId) => {
                        const a = rowA.getValue<number>(columnId) ?? 0;
                        const b = rowB.getValue<number>(columnId) ?? 0;
                        return a - b;
                    }
                    : 'auto',
                cell: info => {
                    const val = info.getValue();
                    if (val == null) return null;

                    if (Array.isArray(val)) {
                        if (
                            val.length > 0 &&
                            typeof val[0] === 'object' &&
                            'name' in (val[0] as License)
                        ) {
                            const names = (val as License[]).map(l => l.name);
                            return <span>{names.join(', ')}</span>;
                        }
                        return <span>{val.join(', ')}</span>;
                    }

                    return <span>{String(val)}</span>;
                },
                sortUndefined: 'last',
            } as ColumnDef<Engine>;
        });

        let displayCols = baseCols;

        if (setMyShipEngines) {
            const myShipCol: ColumnDef<Engine> = {
                id: 'myShipSelect',
                header: () => <span>Add to MyShip</span>,
                // Rückgabe, ob die Zeile aktuell ausgewählt ist
                accessorFn: row => myShipEngines?.includes(row) ?? false,
                // Sorgt dafür, dass unchecked (false) vor checked (true) stehen
                sortingFn: (rowA, rowB, columnId) => {
                    const a = rowA.getValue<boolean>(columnId) ? 1 : 0;
                    const b = rowB.getValue<boolean>(columnId) ? 1 : 0;
                    return a - b;
                },
                // Checkbox mit Checked-State
                cell: ({ row }) => (
                    <input
                        key={"setMyShipEngines-" + row.id}
                        type="checkbox"
                        checked={myShipEngines?.includes(row.original) ?? false}
                        onChange={() => {
                            setMyShipEngines(prev =>
                                prev.includes(row.original)
                                    ? prev.filter(e => e !== row.original)
                                    : [...prev, row.original]
                            );
                        }}
                    />
                ),
            };
            displayCols = [myShipCol, ...displayCols];
        }

        // Wenn Vergleiche aktiviert sind, ganz links eine Sortier-Spalte ergänzen
        if (setEnginesToCompare) {
            const selectCol: ColumnDef<Engine> = {
                id: 'select',
                header: () => <span>Compare</span>,
                // Rückgabe, ob die Zeile aktuell ausgewählt ist
                accessorFn: row => enginesToCompare?.includes(row) ?? false,
                // Sorgt dafür, dass unchecked (false) vor checked (true) stehen
                sortingFn: (rowA, rowB, columnId) => {
                    const a = rowA.getValue<boolean>(columnId) ? 1 : 0;
                    const b = rowB.getValue<boolean>(columnId) ? 1 : 0;
                    return a - b;
                },
                // Checkbox mit Checked-State
                cell: ({ row }) => (
                    <input
                        key={"setEnginesToCompare-" + row.id}
                        type="checkbox"
                        checked={enginesToCompare?.includes(row.original) ?? false}
                        onChange={() => {
                            setEnginesToCompare(prev =>
                                prev.includes(row.original)
                                    ? prev.filter(e => e !== row.original)
                                    : [...prev, row.original]
                            );
                        }}
                    />
                ),
            };
            displayCols = [selectCol, ...displayCols];
        }

        return displayCols;
    }, [
        visibleColumns,
        numericColumns,
        enginesToCompare,
        myShipEngines,
        setEnginesToCompare,
        setMyShipEngines,
    ]);

    // Sortier-Zustand
    const [sorting, setSorting] = useState<SortingState>([]);

    // Table-Instanz erzeugen
    const table = useReactTable<Engine>({
        data: engines,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <>
            <table className="EnginesTable">
                <thead className="EnginesTableHead">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id}>
                                    <div className="th-content">
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        <div className="sort-buttons">
                                            <button
                                                onClick={() => {
                                                    header.column.toggleSorting(false);
                                                    console.log(
                                                        `Column: ${header.column.id}, Direction: Ascending`
                                                    );
                                                }}
                                                className="sort-button"
                                                aria-label="Sort ascending"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                onClick={() => {
                                                    header.column.toggleSorting(true);
                                                    console.log(
                                                        `Column: ${header.column.id}, Direction: Descending`
                                                    );
                                                }}
                                                className="sort-button"
                                                aria-label="Sort descending"
                                            >
                                                ▼
                                            </button>
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="EnginesTableBody">
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="EnginesTableRowCount">
                Total rows: {table.getRowModel().rows.length}
            </div>
        </>
    );
}
