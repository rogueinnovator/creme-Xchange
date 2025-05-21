"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowDown, FileText, FileSpreadsheet } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonProps<TData> {
  data: TData[];
  columns: { id: string; header: string }[];
  filename?: string;
}

export default function ExportButton<TData>({
  data,
  columns,
  filename = "shipments",
}: ExportButtonProps<TData>) {
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      // Extract headers
      const headers = columns.map((column) => column.header);

      // Extract data rows
      const rows = data.map((item) => {
        return columns.map((column) => {
          // Access the property using the column id
          const value = item[column.id as keyof TData];
          // Convert to string and handle null/undefined
          return value !== null && value !== undefined ? String(value) : "";
        });
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();

      // Extract headers and data for PDF
      const headers = columns.map((column) => column.header);
      const rows = data.map((item) => {
        return columns.map((column) => {
          const value = item[column.id as keyof TData];
          return value !== null && value !== undefined ? String(value) : "";
        });
      });

      // Add title
      doc.setFontSize(16);
      doc.text("Shipments Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

      // Create table
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 30,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [43, 62, 69] },
      });

      // Save PDF
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="text-sm border border-gray-300 font-semibold px-3 rounded-2xl flex gap-2 items-center py-1.5 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
      >
        <span className="text-black/80">Export Shipments PDF,CSV</span>
        <ArrowDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center cursor-pointer"
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Export as PDF</span>
          </button>
          <button
            onClick={exportToCSV}
            disabled={isExporting}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center cursor-pointer"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Export as CSV</span>
          </button>
        </div>
      )}
    </div>
  );
}
