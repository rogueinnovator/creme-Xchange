"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import PaginationControls from "./paginationControls";

interface TableDataProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  pageCount: number;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  isLoading: boolean;
}

const DataTable = <TData,>({
  data,
  columns,
  pageCount,
  pagination,
  setPagination,
  sorting,
  setSorting,
  isLoading,
}: TableDataProps<TData>) => {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      pagination,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Tell the table we're handling pagination manually
    manualSorting: true, // Tell the table we're handling sorting manually
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg font-semibold">
        <table className="w-full table-auto">
          <thead className="bg-[#2B3E45] text-white text-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left">
                    {header.column.getCanSort() ? (
                      <div
                        className="flex items-center gap-1 cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp size={16} className="ml-1" />,
                          desc: <ChevronDown size={16} className="ml-1" />,
                        }[header.column.getIsSorted() as string] ?? (
                          <ChevronsUpDown
                            size={16}
                            className="ml-1 opacity-30"
                          />
                        )}
                      </div>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-black"
                >
                  Loading data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-black"
                >
                  No results found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={index % 2 === 0 ? "bg-[#F3F3F3]" : "bg-white"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-5 text-sm text-gray-800"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        currentPage={pagination.pageIndex + 1}
        totalPages={pageCount}
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
        }
        pageSize={pagination.pageSize}
        onPageSizeChange={(size) =>
          setPagination((prev) => ({ ...prev, pageSize: size, pageIndex: 0 }))
        }
      />
    </div>
  );
};

export default DataTable;
