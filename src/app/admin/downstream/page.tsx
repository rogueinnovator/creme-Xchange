/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DataTable from "@/components/dataTables";
import ExportButton from "@/components/exportButton";
import SearchSection from "@/components/searchSection";
import {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
// import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type FineSorting = {
  shipmentId: string;
  shipmentDate: Date;
  itemsReceived: number;
  unSaleableItems: number;
  stockReceived: number;
  returnedItems: number;
};

// const users: FineSorting[] = [
//   {
//     shipmentId: "SHP001",
//     shipmentDate: new Date("2023-10-01"),
//     itemsReceived: 100,
//     unSaleableItems: 5,
//     stockReceived: 95,
//     returnedItems: 2,
//   },
//   {
//     shipmentId: "SHP002",
//     shipmentDate: new Date("2023-10-05"),
//     itemsReceived: 200,
//     unSaleableItems: 10,
//     stockReceived: 190,
//     returnedItems: 5,
//   },
//   {
//     shipmentId: "SHP003",
//     shipmentDate: new Date("2023-10-10"),
//     itemsReceived: 150,
//     unSaleableItems: 8,
//     stockReceived: 142,
//     returnedItems: 3,
//   },
// ];

const columns: ColumnDef<FineSorting>[] = [
  {
    accessorKey: "shipmentId",
    header: "Shipment ID",
    enableSorting: true,
  },
  {
    accessorKey: "shipmentDate",
    header: "Shipment Date",
    enableSorting: true,
    cell: ({ row }) => row.original.shipmentDate.toLocaleDateString(),
  },
  {
    accessorKey: "itemsReceived",
    header: "Items Received",
    enableSorting: true,
  },
  {
    accessorKey: "unSaleableItems",
    header: "Unsaleable Items",
    enableSorting: true,
  },
  {
    accessorKey: "stockReceived",
    header: "Stock Received",
    enableSorting: true,
  },
  {
    accessorKey: "returnedItems",
    header: "Returned Items",
    enableSorting: true,
  },
];

const DownStream = () => {
  const [globalFilter, setGlobalFilter] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<FineSorting[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Build query parameters
        const params = new URLSearchParams({
          page: (pagination.pageIndex + 1).toString(),
          limit: pagination.pageSize.toString(),
        });

        // Add search parameter if it exists
        if (globalFilter) {
          params.append("search", globalFilter);
        }

        // Add sorting parameters if they exist
        if (sorting.length > 0) {
          params.append("sortField", sorting[0].id);
          params.append("sortOrder", sorting[0].desc ? "desc" : "asc");
        }

        const response = await fetch(
          `/api/dashboard/downstream?${params.toString()}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result: any = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch data");
        }

        setData(result.downstream);

        // Set total pages from the response
        setTotalPages(result.pagination?.totalPages || 1);
      } catch (error: any) {
        setError(error?.message || "Something Went Wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter]);

  const exportColumns = columns.map((col: any) => ({
    id: String(col.accessorKey || col.id),
    header: String(
      typeof col.header === "function"
        ? col.header({})
        : col.header || col.accessorKey || col.id
    ),
  }));
  return (
    <>
      <SearchSection
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />

      <div className="flex justify-between items-center ">
        <h2 className="text-2xl font-bold text-black">
          Downstream Fine Sorting
        </h2>
        {/* <button className="text-sm border border-gray-300 font-semibold px-3  rounded-2xl flex gap-2 items-center py-1.5 bg-white">
          <span className="text-black/85">Export Shipments PDF,CSV </span>
          <ArrowDown size={16} />
        </button> */}
        <ExportButton data={data} columns={exportColumns} />
      </div>

      {error ? (
        <h1 className="text-black">Some Thing Went Wrong</h1>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          pageCount={totalPages}
          pagination={pagination}
          setPagination={setPagination}
          sorting={sorting}
          setSorting={setSorting}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default DownStream;
