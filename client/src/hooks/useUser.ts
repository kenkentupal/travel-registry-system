// hooks/useUser.ts
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserWithProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !profile) {
        console.error("Profile fetch error", error);
        setLoading(false);
        return;
      }

      setUser({ ...session.user, ...profile }); // ⬅ Merge session and profile
      setLoading(false);
    };

    getUserWithProfile();
  }, []);

  return { user, loading };
}
