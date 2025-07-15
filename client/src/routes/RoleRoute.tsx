// routes/RoleRoute.tsx
import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { JSX } from "react";

export default function RoleRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: string[];
}) {
  const { user, loading } = useUser();

  if (loading) return null;

  if (!user || !allowedRoles.includes(user.position)) {
    console.warn("Unauthorized access:", user?.position);
    return <Navigate to="/" replace />;
  }

  return children;
}
