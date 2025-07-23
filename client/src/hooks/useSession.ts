import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session from Supabase (it already remembers it internally)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Listen for sign in/out/refresh changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => authListener?.subscription?.unsubscribe();
  }, []);

  return session;
};
