/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DataTable from "@/components/dataTables";
import SearchSection from "@/components/searchSection";
// import { useToast } from "@/components/toast";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

type User = {
  _id: string;
  name: string;
  email: string;
  country: string;
  profile: string;
};

const updateUserStatus = async (userId: string, status: boolean) => {
  // const { showToast } = useToast();
  try {
    // showToast("Updating user status", {
    //   type: "info",
    // });
    const response = await fetch("/api/dashboard/update-user-status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, status }),
    });
    if (!response.ok) {
      throw new Error("Failed to update user status");
    }
    alert("User status updated successfully");

    // showToast("User status updated successfully", {
    //   type: "success",
    // });
    return true;
  } catch (error) {
    alert("Failed to update user status");
    // showToast("Failed to update user status", {
    //   type: "error",
    // });
    console.error(error);
    return false;
  }
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
  },
  {
    accessorKey: "country",
    header: "Country",
    enableSorting: true,
  },
  {
    accessorKey: "profile",
    header: "Profile",
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Quick Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <button
          onClick={async () => {
            const success = await updateUserStatus(row.original._id, true);
            if (success) {
              // Optionally refresh data after successful update
            }
          }}
          className="p-2 bg-[#2B3E45] text-white rounded-full cursor-pointer"
        >
          <Check size={20} />
        </button>
        <button
          onClick={async () => {
            const success = await updateUserStatus(row.original._id, false);
            if (success) {
              // Optionally refresh data after successful update
            }
          }}
          className="p-2 bg-[#2B3E45] text-white rounded-full cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>
    ),
  },
];

const Dashboard = () => {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [data, setData] = useState<User[]>([]);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Fetch data whenever pagination, sorting, or globalFilter changes
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

        if (globalFilter) {
          params.append("search", globalFilter);
        }

        // Add sorting parameters if sorting is applied
        if (sorting.length > 0) {
          params.append("sortField", sorting[0].id);
          params.append("sortOrder", sorting[0].desc ? "desc" : "asc");
        }

        console.log("Fetching with params:", params.toString());
        console.log("Current sorting:", sorting);

        const response = await fetch(
          `/api/dashboard/users?${params.toString()}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const result: any = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch users");
        }

        setData(result.users);
        setTotalPages(result.totalPages);
      } catch (error: any) {
        setError(error?.message || "Something Went Wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter]);

  return (
    <>
      <SearchSection
        globalFilter={globalFilter}
        setGlobalFilter={(value) => {
          setGlobalFilter(value);
          // Reset to first page when searching
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
      />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-black">Users</h2>
        {/* <button className="text-sm border border-gray-300 font-semibold px-3 rounded-2xl flex gap-2 items-center py-1.5 bg-white">
          <ChevronsUpDown size={16} color="black" />
          <span className="text-black/80">Sort by Letters</span>
        </button> */}
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>
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

export default Dashboard;
