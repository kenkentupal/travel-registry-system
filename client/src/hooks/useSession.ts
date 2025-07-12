// hooks/useSession.ts
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface MinimalSession {
  access_token: string;
  refresh_token: string;
}

export const useSession = () => {
  const [session, setSession] = useState<MinimalSession | null>(null);

  useEffect(() => {
    const storedSession = localStorage.getItem("supabase_session");

    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      setSession(sessionData);

      supabase.auth
        .setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        })
        .then(() => {
          console.log("✅ Supabase session restored from tokens");

          // Check if Supabase knows the user
          supabase.auth.getUser().then((res) => {
            console.log("🔐 Current User:", res.data.user);
          });
        })
        .catch((err) => {
          console.error("❌ Failed to restore session:", err);
        });
    }
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const minimalSession = {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          };

          localStorage.setItem(
            "supabase_session",
            JSON.stringify(minimalSession)
          );
          setSession(minimalSession);
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
