import { useState } from "react";

interface PaginatedTableProps<T> {
  data: T[];
  columns: { label: string; render: (item: T) => React.ReactNode }[];
  itemsPerPage?: number;
}

export default function PaginatedTable<T>({
  data,
  columns,
  itemsPerPage = 10,
}: PaginatedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = Math.min(startIdx + itemsPerPage, data.length);
  const currentData = data.slice(startIdx, endIdx);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
      <table className="w-full text-sm text-left text-gray-800 dark:text-gray-100">
        <thead>
          <tr className="text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/10">
            {columns.map((col) => (
              <th key={col.label} className="py-2 px-3 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
          {currentData.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-5 py-4 break-words">
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center px-4 py-4 text-sm">
        <p className="text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium">{startIdx + 1}</span> to{" "}
          <span className="font-medium">{endIdx}</span> of{" "}
          <span className="font-medium">{data.length}</span> entries
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md border text-sm font-medium ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 dark:bg-gray-800 cursor-not-allowed"
                : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-white"
            }`}
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md border text-sm font-medium ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 dark:bg-gray-800 cursor-not-allowed"
                : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-white"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
