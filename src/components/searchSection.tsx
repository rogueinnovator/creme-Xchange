"use client";
import { Search } from "lucide-react";
import type React from "react";

import { useState } from "react";

interface SearchSectionProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  onSearch?: () => void;
}

const SearchSection = ({
  globalFilter,
  setGlobalFilter,
  onSearch,
}: SearchSectionProps) => {
  const [searchValue, setSearchValue] = useState(globalFilter);

  const handleSearch = () => {
    setGlobalFilter(searchValue);
    if (onSearch) onSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6 ">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-3xl focus:outline-none focus:ring-1 focus:ring-[#2B3E45] text-black"
        />
        <button
          onClick={handleSearch}
          className="absolute left-3 top-1/2 transform -translate-y-1/2"
        >
          <Search size={18} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default SearchSection;
