import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({
  size = "md", // Default size
  variant = "primary", // Default variant
  className = "",
  children,
  ...props
}: ButtonProps) {
  // Size classes for the button
  const sizeClasses = {
    sm: "px-4 py-2 text-sm", // Small button
    md: "px-6 py-3 text-base", // Medium button (default)
    lg: "px-8 py-4 text-lg", // Large button
  };

  // Variant classes for different button styles
  const variantClasses = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500", // Primary button style
    secondary:
      "bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500", // Secondary button style
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500", // Danger button style
  };

  return (
    <button
      className={`w-full h-12 block rounded-md border border-gray-300 dark:border-gray-600 ${sizeClasses[size]} ${variantClasses[variant]} focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
