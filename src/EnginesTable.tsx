import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    type ColumnDef,
    type SortingState,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import type { Engine } from './App';
import './EnginesTable.css';

export interface EnginesTableProps {
    engines: Engine[];
    visibleColumns: string[];
    selectedLicenses: string[];
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
    selectedLicenses,
}: EnginesTableProps) {
    //  Dynamisch ermitteln, welche Columns numeric sind:
    //    Eine Column gilt als numeric, wenn in filteredData mindestens ein Wert an dieser Column eine number ist.
    const numericColumns = useMemo<Set<string>>(() => {
        const set = new Set<string>();
        visibleColumns.forEach(key => {
            if (engines.some(row => typeof (row as any)[key] === 'number')) {
                set.add(key);
            }
        });
        return set;
    }, [visibleColumns, engines]);

    //  Spalten-Definitionen: für numeric Columns custom sortingFn, sonst 'auto'
    const columns = useMemo<ColumnDef<Engine>[]>(
        () =>
            visibleColumns.map(key => {
                const isNumeric = numericColumns.has(key);
                return {
                    accessorKey: key,
                    header: () => <span>{toHeader(key)}</span>,
                    sortingFn: isNumeric
                        ? (rowA, rowB, columnId) => {
                            const a = rowA.getValue<number>(columnId);
                            const b = rowB.getValue<number>(columnId);
                    
                            // Handle empty values explicitly
                            if (a == null && b == null) return 0; // Both are empty
                            if (a == null) return 1; // `a` is empty, place it after `b`
                            if (b == null) return -1; // `b` is empty, place it after `a`
                    
                            return a - b; // Normal numeric comparison
                        }
                        : 'auto',
                    cell: info => {
                        const val = info.getValue();
                        if (val == null) return null;
                        if (Array.isArray(val)) {
                            return <span>{val.join(', ')}</span>;
                        }
                        return <span>{String(val)}</span>;
                    },
                    sortUndefined: 'last',
                } as ColumnDef<Engine>;
            }),
        [visibleColumns, numericColumns]
    );

    //  Sorting state
    const [sorting, setSorting] = useState<SortingState>([]);

    // Table-Instanz
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
    );
}