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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Retailer = {
  shipmentId: string;
  totalSold: number;
  returnItemsInBales: number;
};

// const users: Retailer[] = [
//   {
//     shipmentId: "SHP001",
//     totalSold: 150,
//     returnItemsInBales: 5,
//   },
//   {
//     shipmentId: "SHP002",
//     totalSold: 200,
//     returnItemsInBales: 3,
//   },
//   {
//     shipmentId: "SHP003",
//     totalSold: 120,
//     returnItemsInBales: 2,
//   },
//   {
//     shipmentId: "SHP004",
//     totalSold: 180,
//     returnItemsInBales: 4,
//   },
//   {
//     shipmentId: "SHP005",
//     totalSold: 250,
//     returnItemsInBales: 6,
//   },
// ];

const columns: ColumnDef<Retailer>[] = [
  {
    accessorKey: "shipmentId",
    header: "Shipment ID",
    enableSorting: true,
  },
  {
    accessorKey: "totalSold",
    header: "Total Sold",
    enableSorting: true,
  },
  {
    accessorKey: "returnItemsInBales",
    header: "Return Items (Bales)",
    enableSorting: true,
  },
];

const Retailer = () => {
  // const pathName = usePathname();
  const [globalFilter, setGlobalFilter] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Retailer[]>([]);
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

        // Use search endpoint if there's a search term, otherwise use regular endpoint

        const response = await fetch(
          `/api/dashboard/retailer?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch retailers");
        }

        const result: any = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch retailers");
        }

        setData(result.retailers);
        setTotalPages(result.pagination?.totalPages || 1);
      } catch (error: any) {
        setError(error?.message || "Something Went Wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter]);

  // Prepare column data for export
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
        <h2 className="text-2xl font-bold text-black">Retailer</h2>
        {/* <button className="text-sm border border-gray-300 font-semibold px-3  rounded-2xl flex gap-2 items-center py-1.5 bg-white">
          <span className="text-black/80">Export Shipments PDF,CSV </span>
          <ArrowDown size={16} />
        </button> */}
        <ExportButton data={data} columns={exportColumns} />
      </div>

      {error ? (
        <h1 className="text-black">Some Thing Went Wrong</h1>
      ) : isLoading ? (
        <div className="w-full h-full flex justify-center items-center">
          <Loader2 className="animate-spin text-[#2B3E45]" size={36} />
        </div>
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

export default Retailer;
