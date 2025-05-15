import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import type { Engine } from './App';

interface Props { engines: Engine[]; }

// Utility to title-case column headers
const toHeader = (key: string) =>
    key
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

export default function EnginesTable({ engines }: Props) {
    // Gather all unique keys present across engine objects
    const allKeys = useMemo(() => {
        const set = new Set<string>();
        engines.forEach(e => Object.keys(e).forEach(k => set.add(k)));
        return Array.from(set);
    }, [engines]);

    // Define default column order
    const defaultOrder = [
        'name', 'cost', 'mass', 'outfit space', 'engine capacity', 'turn',
        'turning energy', 'turning heat', 'slowing resistance', 'frame rate',
        'steering flare sprite', 'steering flare sound', 'thumbnail', 'source'
    ];

    // Sorting state
    const [sorting, setSorting] = useState([]);

    // Dynamically construct columns
    const columns = useMemo<ColumnDef<Engine>[]>(() => {
        // Place known columns first, then extras
        const orderedKeys = [
            ...defaultOrder.filter(k => allKeys.includes(k)),
            ...allKeys.filter(k => !defaultOrder.includes(k))
        ];

        return orderedKeys.map(key => {
            const base: ColumnDef<Engine> = {
                accessorKey: key,
                header: () => <span>{toHeader(key)}</span>,
                // Use alphanumeric sort for strings, basic for numbers
                sortingFn: 'auto',
                cell: info => {
                    const val = info.getValue();
                    if (key === 'thumbnail' && typeof val === 'string') {
                        return <img src={val} alt={info.row.original.name} className="w-8 h-8" />;
                    }
                    return <span>{Array.isArray(val) ? val.join(', ') : String(val)}</span>;
                }
            };
            return base;
        });
    }, [allKeys]);

    const table = useReactTable({
        data: engines,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        debugTable: false,
    });

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
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {/* Sort asc */}
                                    <button
                                        onClick={() => header.column.toggleSorting(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                        aria-label="Sort ascending"
                                    >
                                        ▲
                                    </button>
                                    {/* Sort desc */}
                                    <button
                                        onClick={() => header.column.toggleSorting(true)}
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