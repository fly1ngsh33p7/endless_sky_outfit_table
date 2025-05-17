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
    setEnginesToCompare?: React.Dispatch<React.SetStateAction<Engine[]>>;
}

// Utility to title-case column headers
const toHeader = (key: string) =>
    key
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

export default function EnginesTable({
    engines,
    visibleColumns,
    setEnginesToCompare,
}: EnginesTableProps) {
    // Dynamisch erkennen, welche Columns numeric sind
    const numericColumns = useMemo<Set<string>>(() => {
        const set = new Set<string>();
        visibleColumns.forEach(key => {
            if (engines.some(row => typeof (row as any)[key] === 'number')) {
                set.add(key);
            }
        });
        return set;
    }, [visibleColumns, engines]);

    // 3) Spalten-Definitionen mit angepasster cell-Renderer
    const columns = useMemo<ColumnDef<Engine>[]>(
        () =>
            visibleColumns.map(key => {
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

                        // Wenn ein Array vorliegt
                        if (Array.isArray(val)) {
                            // Array von License-Objekten?
                            if (val.length > 0 && typeof val[0] === 'object' && 'name' in (val[0] as License)) {
                                const names = (val as License[]).map(l => l.name);
                                return <span>{names.join(', ')}</span>;
                            }
                            // Sonst Array von Strings oder Zahlen
                            return <span>{val.join(', ')}</span>;
                        }

                        // Alle anderen Typen als String ausgeben
                        return <span>{String(val)}</span>;
                    },
                    sortUndefined: 'last',
                } as ColumnDef<Engine>;
            });

            // Falls setEnginesToCompare bereitsteht, eine Select-Spalte ergänzen
            if (setEnginesToCompare) {
                const selectCol: ColumnDef<Engine> = {
                    id: 'select',
                    header: () => <span></span>, // leerer Header
                    sortingFn: 'auto',
                    cell: ({ row }) => (
                        <input
                            type="checkbox"
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
                return [selectCol, ...baseCols];
            }

            return baseCols;
        },
        [visibleColumns, numericColumns, setEnginesToCompare]
    );

    // 4) Sorting state
    const [sorting, setSorting] = useState<SortingState>([]);

    // 5) Table-Instanz
    const table = useReactTable<Engine>({
        data: engines,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    // Render
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
