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

type FineSorting = {
  shipmentId: string;
  numberOfBags: number;
  itemTypes: string;
  locationOfShop: string;
  grade: string;
};

// const users: FineSorting[] = [
//   {
//     shipmentId: "SHP001",
//     numberOfBags: 25,
//     itemTypes: "Coffee Beans",
//     locationOfShop: "Nairobi, Kenya",
//     grade: "Grade A",
//   },
//   {
//     shipmentId: "SHP002",
//     numberOfBags: 40,
//     itemTypes: "Tea Leaves",
//     locationOfShop: "Kigali, Rwanda",
//     grade: "Grade B",
//   },
//   {
//     shipmentId: "SHP003",
//     numberOfBags: 15,
//     itemTypes: "Cocoa",
//     locationOfShop: "Accra, Ghana",
//     grade: "Grade A",
//   },
//   {
//     shipmentId: "SHP004",
//     numberOfBags: 30,
//     itemTypes: "Spices",
//     locationOfShop: "Mumbai, India",
//     grade: "Grade C",
//   },
//   {
//     shipmentId: "SHP005",
//     numberOfBags: 50,
//     itemTypes: "Herbs",
//     locationOfShop: "Addis Ababa, Ethiopia",
//     grade: "Grade B",
//   },
// ];

const columns: ColumnDef<FineSorting>[] = [
  {
    accessorKey: "shipmentId",
    header: "Shipment ID",
    enableSorting: true,
  },
  {
    accessorKey: "numberOfBags",
    header: "Number of Bags",
    enableSorting: true,
  },
  {
    accessorKey: "itemTypes",
    header: "Item Types",
    enableSorting: true,
  },
  {
    accessorKey: "locationOfShop",
    header: "Location of Shop",
    enableSorting: true,
  },
  {
    accessorKey: "grade",
    header: "Grade",
    enableSorting: true,
  },
];

const FineSorting = () => {
  const pathName = usePathname();
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
          `/api/dashboard/upstream/fine-sorting?${params.toString()}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch fine sorting data");
        }

        const result: any = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Failed to fetch fine sorting data"
          );
        }

        setData(result.batchesLists);
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
      <div className="bg-white rounded-lg px-2 py-4 font-semibold w-max">
        <Link
          href="/admin/upstream/batches-information"
          className={`text-black px-6 py-3 rounded-md ${
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
        <h2 className="text-2xl font-bold text-black">Fine Sorting</h2>
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

export default FineSorting;
