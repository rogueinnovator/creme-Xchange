/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/dataTables";
import SearchSection from "@/components/searchSection";
import { useToast } from "@/components/toast";
import {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";

type UserRole = {
  _id: string;
  name: string;
  email: string;
  country: string;
  profile: string;
};

const RoleManagement = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<UserRole[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const { showToast } = useToast(); // ✅ Moved here

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<UserRole>[]>(
    () => [
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
        id: "actions",
        header: "Quick Actions",
        cell: ({ row }) => {
          return (
            <div className="flex space-x-2">
              <select
                className="rounded px-2 outline-none bg-[#EBEBEB] py-1.5"
                defaultValue={row.original.profile}
                onChange={async (e) => {
                  const newRole = e.target.value;
                  const userId = row.original._id;
                  try {
                    const res = await fetch("/api/dashboard/role-management", {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ userId, newRole }),
                    });

                    if (!res.ok) throw new Error("Failed to update role");

                    showToast("User role updated successfully", {
                      type: "success",
                    });
                  } catch {
                    showToast("Failed to update role", {
                      type: "error",
                    });
                  }
                }}
              >
                <option value="upstream">Upstream</option>
                <option value="downstream">Downstream</option>
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
              </select>
            </div>
          );
        },
      },
    ],
    [showToast]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: (pagination.pageIndex + 1).toString(),
          limit: pagination.pageSize.toString(),
        });

        if (globalFilter) {
          params.append("search", globalFilter);
        }

        if (sorting.length > 0) {
          params.append("sortField", sorting[0].id);
          params.append("sortOrder", sorting[0].desc ? "desc" : "asc");
        }

        const response = await fetch(
          `/api/dashboard/role-management?${params.toString()}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        type ApiResponse = {
          success: boolean;
          message?: string;
          users: UserRole[];
          pagination?: { totalPages: number };
        };

        const result: ApiResponse = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch users");
        }

        setData(result.users);
        setTotalPages(result.pagination?.totalPages || 1);
      } catch (error: any) {
        setError(error?.message || "Something went wrong");
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
        setGlobalFilter={setGlobalFilter}
      />
      <div className="flex justify-between items-center ">
        <h2 className="text-2xl font-bold text-black">Role Management</h2>
      </div>

      {error ? (
        <h1 className="text-black">Something went wrong</h1>
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

export default RoleManagement;
