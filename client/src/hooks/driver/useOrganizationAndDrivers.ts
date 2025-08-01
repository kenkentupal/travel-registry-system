// hooks/driver/useOrganizationAndDrivers.ts
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Driver } from "../../types/driver";

export function useOrganizationAndDrivers(organizationId?: string) {
  const [organizationName, setOrganizationName] = useState("Loading...");
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!organizationId) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      try {
        const orgRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/organizations/${organizationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const orgData = await orgRes.json();
        setOrganizationName(orgData.name || "Unknown");

        const driversRes = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/profiles/drivers/${organizationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const driverData = await driversRes.json();
        if (driversRes.ok) {
          driverData.sort((a: Driver, b: Driver) =>
            a.display_name.localeCompare(b.display_name)
          );
          setDrivers(driverData);
        }
      } catch (err) {
        console.error("Error fetching org or drivers", err);
      }
    };

    fetchData();
  }, [organizationId]);

  return { organizationName, drivers };
}
