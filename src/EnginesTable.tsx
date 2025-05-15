import { Engine } from "./App";
import {
    useReactTable,
    ColumnDef,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import React from "react";

interface Props {
    engines: Engine[];
}

const columns: ColumnDef<Engine>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "cost", header: "Cost" },
    { accessorKey: "mass", header: "Mass" },
    { accessorKey: "outfit space", header: "Outfit Space" },
    { accessorKey: "engine capacity", header: "Engine Capacity" },
    { accessorKey: "turn", header: "Turn" },
    { accessorKey: "turning energy", header: "Turning Energy" },
    { accessorKey: "turning heat", header: "Turning Heat" },
    { accessorKey: "slowing resistance", header: "Slowing Resistance" },
    { accessorKey: "frame rate", header: "Frame Rate" },
    { accessorKey: "steering flare sprite", header: "Flare Sprite" },
    { accessorKey: "steering flare sound", header: "Flare Sound" },
    {
        accessorKey: "thumbnail",
        header: "Thumbnail",
        cell: (info) => (
            <img src={info.getValue() as string} alt="" className="w-8 h-8" />
        ),
    },
    { accessorKey: "source", header: "Source" },
];

export default function EnginesTable({ engines }: Props) {
    const table = useReactTable({
        data: engines,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
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
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
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
