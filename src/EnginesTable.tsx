import React, { useMemo } from 'react';
import { useReactTable, type ColumnDef, getCoreRowModel, flexRender } from '@tanstack/react-table';
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

    // Construct ColumnDef array dynamically
    const columns = useMemo<ColumnDef<Engine>[]>(() => {
        // Place known columns first, then any extras
        const orderedKeys = [
            ...defaultOrder.filter(k => allKeys.includes(k)),
            ...allKeys.filter(k => !defaultOrder.includes(k))
        ];

        return orderedKeys.map(key => {
            // Special thumbnail column renderer
            if (key === 'thumbnail') {
                return {
                    accessorKey: key,
                    header: toHeader(key),
                    cell: info => (
                        <img
                            src={info.getValue() as string}
                            alt={info.row.original.name}
                            className="w-8 h-8"
                        />
                    )
                } as ColumnDef<Engine>;
            }

            return {
                accessorKey: key,
                header: toHeader(key)
            } as ColumnDef<Engine>;
        });
    }, [allKeys]);

    const table = useReactTable({
        data: engines,
        columns,
        getCoreRowModel: getCoreRowModel(),
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
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
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
