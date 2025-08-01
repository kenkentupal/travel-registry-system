import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getUserWithProfile = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(); // ✅ gets latest metadata

    if (!user || userError) {
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*, organizations(name)")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error", profileError);
      setLoading(false);
      return;
    }

    setUser({ ...user, ...profile }); // ✅ merged latest auth metadata + profile
    setLoading(false);
  };

  useEffect(() => {
    getUserWithProfile();
  }, []);

  return { user, loading, refresh: getUserWithProfile };
}
