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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type BatchesInfo = {
  shipmentId: string;
  shipmentDate: string;
  arrivalDate: string;
  category: string;
  origin: string;
  destination: string;
  weight: string;
};
const columns: ColumnDef<BatchesInfo>[] = [
  {
    accessorKey: "shipmentId",
    header: "Shipment ID",
    enableSorting: true,
  },
  {
    accessorKey: "shipmentDate",
    header: "Shipment Date",
    enableSorting: true,
  },
  {
    accessorKey: "arrivalDate",
    header: "Arrival Date",
    enableSorting: true,
  },
  {
    accessorKey: "category",
    header: "Category",
    enableSorting: true,
  },
  {
    accessorKey: "origin",
    header: "Origin",
    enableSorting: true,
  },
  {
    accessorKey: "destination",
    header: "Destination",
    enableSorting: true,
  },
  {
    accessorKey: "weight",
    header: "Weight",
    enableSorting: true,
  },
];

const BranchesInformation = () => {
  const pathName = usePathname();
  const [globalFilter, setGlobalFilter] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<BatchesInfo[]>([]);
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
          `/api/dashboard/upstream/batches-information?${params.toString()}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch batches");
        }

        const result: any = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch batches");
        }

        setData(result.batches);
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
      <div className="bg-white rounded-lg px-2 py-4 font-semibold w-max">
        <Link
          href="/admin/upstream/batches-information"
          className={` px-6 py-3 rounded-md ${
            pathName === "/admin/upstream/batches-information" &&
            "bg-[#2B3E45] text-white"
          }`}
        >
          Batches Information
        </Link>
        <Link
          href="/admin/upstream/fine-sorting"
          className={`text-black px-6 py-3 rounded-md ${
            pathName === "/admin/upstream/fine-sorting" &&
            "bg-[#2B3E45] text-white"
          }`}
        >
          Fine Sorting
        </Link>
      </div>

      <div className="flex justify-between items-center ">
        <h2 className="text-2xl text-black font-bold">Batches Information</h2>
        {/* <button className="text-sm border border-gray-300 font-semibold px-3  rounded-2xl flex gap-2 items-center py-1.5 bg-white">
          <span className="text-black">Export Shipments PDF,CSV </span>
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

export default BranchesInformation;
