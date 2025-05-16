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
                } as ColumnDef<Engine>;
            }),
        [visibleColumns, numericColumns]
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
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                >
                                    <div className="flex items-center space-x-2">
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        <button
                                            onClick={() => {
                                                header.column.toggleSorting(false);
                                                console.log(`Column: ${header.column.id}, Direction: Ascending`);
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                            aria-label="Sort ascending"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            onClick={() => {
                                                header.column.toggleSorting(true);
                                                console.log(`Column: ${header.column.id}, Direction: Descending`);
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                            aria-label="Sort descending"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td
                                    key={cell.id}
                                    className="px-4 py-2 whitespace-nowrap text-sm text-gray-700"
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 text-sm text-gray-500">
                Total rows: {table.getRowModel().rows.length}
            </div>
        </>
    );
}
