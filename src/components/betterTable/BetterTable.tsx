import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import './BetterTable.css';

export interface BetterTableProps {
    data?: any[];
}

export default function BetterTable({
    data = [],
}: BetterTableProps) {

    const table = useReactTable<any>({
        data: data,
        columns: [],
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <>
            <table className="BetterTable">
                <thead className="BetterTableHead">
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
                <tbody className="BetterTableBody">
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
                {/* {setAmounts && (
                    <tfoot className="BetterTableFooter">
                        <tr>
                            {table._getColumnDefs().map((colDef, idx) => {
                                const id = colDef.id ?? (colDef as any).accessorKey;
                                const isFirst = idx === 0;
                                return (
                                    <td key={id}>
                                        {isFirst
                                            ? 'Total'
                                            : totals[id] !== undefined
                                                ? totals[id]
                                                : ''}
                                    </td>
                                );
                            })}
                        </tr>
                    </tfoot>
                )} */}
            </table>
            <div className="BetterTableRowCount">
                Total rows: {table.getRowModel().rows.length}
            </div>
        </>
    );
}