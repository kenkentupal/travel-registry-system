// hooks/useSession.ts
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email?: string;
    email_confirmed_at?: string | null;
    [key: string]: any;
  };
}

export const useSession = () => {
  const [session, setSession] = useState<SupabaseSession | null>(null);

  useEffect(() => {
    const storedSession = localStorage.getItem("supabase_session");
    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      setSession(sessionData);
      supabase.auth
        .setSession(sessionData)
        .then(() => {
          console.log("Session restored from localStorage.");
        })
        .catch((error) => {
          console.error("Error restoring session:", error);
        });
    }
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          localStorage.setItem("supabase_session", JSON.stringify(session));
          setSession(session);
        } else if (event === "SIGNED_OUT") {
          localStorage.removeItem("supabase_session");
          setSession(null);
        }
      }
    );

    return () => listener?.subscription?.unsubscribe();
  }, []);

  return session;
};
