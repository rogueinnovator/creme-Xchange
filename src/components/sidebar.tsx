"use client";

import type React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  TrendingDown,
  Store,
  ShoppingBag,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function Sidebar() {
  const pathName = usePathname();
  const session = useSession();
  const sidebarItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      active: pathName === "/admin/dashboard",
      link: "/admin/dashboard",
    },
    {
      icon: <Users size={20} />,
      label: "Role Management",
      active: pathName === "/admin/role-management",
      link: "/admin/role-management",
    },
    {
      icon: <TrendingUp size={20} />,
      label: "Upstream",
      active:
        pathName === "/admin/upstream/batches-information" ||
        pathName == "/admin/upstream/fine-sorting",
      link: "/admin/upstream",
    },
    {
      icon: <TrendingDown size={20} />,
      label: "Downstream",
      active: pathName === "/admin/downstream",
      link: "/admin/downstream",
    },
    {
      icon: <Store size={20} />,
      label: "Wholesaler",
      active: pathName === "/admin/wholesaler",
      link: "/admin/wholesaler",
    },
    {
      icon: <ShoppingBag size={20} />,
      label: "Retailer",
      active: pathName === "/admin/retailer",
      link: "/admin/retailer",
    },
  ];

  return (
    <aside className="w-72 bg-white h-screen ">
      <div className="h-16 flex items-center px-6 ">
        <Image
          src="/images/Logo(black).png"
          alt="logo"
          width={200}
          height={200}
          className="object-contain pr-2"
        />
        <Image
          src="/images/arrow.svg"
          alt="logo"
          width={100}
          height={100}
          className="object-contain"
        />
      </div>
      <nav className="mt-6 px-3 flex flex-col gap-1 text-black">
        {sidebarItems.map((item, index: number) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            active={item.active}
            link={item.link}
          />
        ))}
      </nav>
      <div className="absolute bottom-0 w-64 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
            {session?.data?.user?.firstName[0]}{" "}
            {session?.data?.user?.lastName[0]}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{`${session?.data?.user?.firstName} ${session?.data?.user?.lastName}`}</p>
            {/* <p className="text-xs text-gray-500">Trader</p> */}
          </div>
        </div>
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  link: string;
  active?: boolean;
}

function SidebarItem({ icon, label, link, active = false }: SidebarItemProps) {
  return (
    <Link
      href={link}
      className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg mb-1 ${
        active
          ? "text-white bg-[#2B3E45]"
          : " hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
}
