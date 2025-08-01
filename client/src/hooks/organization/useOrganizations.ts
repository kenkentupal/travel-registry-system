import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Organization } from "../../types/organization";

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("*");
        if (error) throw error;
        setOrganizations(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch organizations");
        setOrganizations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizations();
  }, []);

  return { organizations, loading, error };
}
