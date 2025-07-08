// ProtectedRoute.tsx
import { JSX, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useSyncUser } from "../hooks/useSyncUser";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const sessionFromStorage = localStorage.getItem("supabase.auth.token");
        if (sessionFromStorage) {
          const sessionData = JSON.parse(sessionFromStorage);
          setSession(sessionData);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session fetch error:", error.message);
        } else {
          setSession(data.session);
        }
      } catch (error) {
        console.error("Error restoring session:", error);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => listener?.subscription?.unsubscribe();
  }, []);

  useSyncUser(session);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        Please Reload
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
