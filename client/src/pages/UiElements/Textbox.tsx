// Textbox Component (for consistency in styling)
import React from "react";

interface TextboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Textbox({
  label,
  className = "",
  ...props
}: TextboxProps) {
  return (
    <div className="w-full">
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        className={`w-full h-10 px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none ${className}`}
        {...props}
      />
    </div>
  );
}
