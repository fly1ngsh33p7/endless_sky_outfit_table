import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, } from "@tanstack/react-table";
import './BetterTable.css';
import { useEffect, useMemo, useState } from "react";

export interface BetterTableProps {
    data?: any[];
}

export default function BetterTable({
    data = [],
}: BetterTableProps) {

    const [maxColumns, setMaxColumns] = useState<number>(10);

    const [columns, setColumns] = useState<ColumnDef<any, any>[]>([]);

    const getAllFieldNamesOfData = (excludeFields: string[] = []): string[] => {
        const fieldSet = new Set<string>();
    
        // Check if data is empty
        if (!data || Object.keys(data).length === 0) {
            return []; // Return an empty array if data is not yet populated
        }

        // Convert wildcard patterns in excludeFields to regular expressions
        const excludePatterns = excludeFields.map((pattern) =>
            new RegExp(
                '^' +
                pattern.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*') +
                '$',
                'i' // Case-insensitive matching
            )
        );
    
        // Iterate over all categories in dataStore
        Object.values(data).forEach((outfit: {}) => {
            // Add all keys (field names) of the outfit to the set
            Object.keys(outfit).forEach((key) => fieldSet.add(key));
        });
    
        // Convert the set to an array and filter out excluded fields
        // return Array.from(fieldSet).filter((field) => !excludeFields.includes(field));
        // Filter fields based on the excludePatterns and minOutfits parameters
        return Array.from(fieldSet)
            .filter((field) =>
                !excludePatterns.some((regex) => regex.test(field)) //&& count >= minOutfits
            )
            .map((field) => field);
    };

    const numericColumns = useMemo(() => {
        const set = new Set<string>();
        if (data && data.length > 0) {
        data.forEach(row => {
            Object.keys(row).forEach(key => {
            if (typeof row[key] === 'number') {
                set.add(key);
            }
            });
        });
        }
        return set;
    }, [data]);

    // generate Columns when data changes
    useEffect(() => {
        const ignorePatterns = [
            '*thumbnail*', '*flare*', '*afterburner*effect*', '*description*', 'unplunderable', 'display name', 
        ];
        
        const generatedColumns = getAllFieldNamesOfData(ignorePatterns).slice(0, maxColumns).map(key => {
            const isNumeric = numericColumns.has(key);

            // Helper: format key to heading
            const toHeadingFormat = (key: string) =>
                key
                    .split(/\s+/)
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');

            return {
                accessorKey: key,
                header: () => <span>{toHeadingFormat(key)}</span>,
                sortingFn: isNumeric
                    ? (rowA, rowB, columnId) => {
                            const valA = rowA.getValue<number>(columnId) ?? 0;
                            const valB = rowB.getValue<number>(columnId) ?? 0;
                            const aAmt = 1; //getAmount(rowA.original);
                            const bAmt = 1; //getAmount(rowB.original);
                            return (valA * aAmt) - (valB * bAmt);
                        }
                    : 'auto',
                cell: info => {
                    const val = info.getValue<unknown>();
                    if (val == null) return null;
                    // Numeric multiplication
                    if (isNumeric && typeof val === 'number') {
                        const amt = 1; //getAmount(info.row.original);
                        return <span>{val * amt}</span>;
                    }
                    return <span>{String(val)}</span>;
                },
                sortUndefined: 'last', // FIXME: sometimes undefined should be treated as 0 (see outfit space with hand to hand) -> this could be fixed when loading outfits.json....
            } as ColumnDef<any>;
        });

        setColumns(generatedColumns);
    }, [data, numericColumns, maxColumns]);

    const table = useReactTable<any>({
        data: data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <>
            <label>
                {" "}max columns:{" "}
                <input
                    type="number"
                    min={1}
                    value={maxColumns}
                    onChange={(e) => setMaxColumns(Number(e.target.value))}
                    placeholder="max columns"
                />
                <button onClick={() => setMaxColumns(10)}>reset column count</button>
            </label>
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