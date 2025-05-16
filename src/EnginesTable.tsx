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
    // 1) Erst nach Licenses filtern:
    const filteredData = useMemo(() => {
        if (selectedLicenses.length === 0) return engines;
        return engines.filter(engine => {
            const lic = engine.licenses;
            if (Array.isArray(lic)) {
                return lic.some(l => selectedLicenses.includes(l));
            }
            if (typeof lic === 'string') {
                return selectedLicenses.includes(lic);
            }
            return false;
        });
    }, [engines, selectedLicenses]);

    // 2) Spalten-Definitionen
    const columns = useMemo<ColumnDef<Engine>[]>(
        () =>
            visibleColumns.map(key => ({
                accessorKey: key,
                header: () => <span>{toHeader(key)}</span>,
                sortingFn: 'auto',
                cell: info => {
                    const val = info.getValue();
                    if (val == null) return null;
                    if (Array.isArray(val)) {
                        return <span>{val.join(', ')}</span>;
                    }
                    return <span>{String(val)}</span>;
                },
            })),
        [visibleColumns]
    );

    // 3) Sorting state mit korrektem Typ
    const [sorting, setSorting] = useState<SortingState>([]);

    // 4) React Table instanziieren
    const table = useReactTable<Engine>({
        data: filteredData,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    // 5) Render
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
                                        onClick={() => header.column.toggleSorting(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                        aria-label="Sort ascending"
                                    >
                                        ▲
                                    </button>
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
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
