"use client";
import React, { useState } from "react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const session = useSession();

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  //   console.log(session.data.user.);

  return (
    <div className="relative flex justify-between items-center bg-white text-black px-10 py-4 rounded-2xl shadow-md">
      <h1 className="text-2xl font-semibold">
        Hello, {session?.data?.user?.firstName}
      </h1>

      <div className="relative">
        <Image
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJxo2NFiYcR35GzCk5T3nxA7rGlSsXvIfJwg&s"
          alt="User"
          width={50}
          height={50}
          className="rounded-full h-10 w-10 cursor-pointer"
          onClick={handleToggleDropdown}
        />
        {dropdownOpen && (
          <div className="absolute -right-8 mt-1 w-30 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <button
              onClick={() => {
                signOut();
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 "
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
