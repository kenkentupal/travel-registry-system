// hooks/vehicle/useVehicles.ts
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Vehicle } from "../../types/vehicle";

async function fetchAssignmentStatus(
  vehicleId: number,
  token: string,
  apiUrl: string
): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/api/qrcode/${vehicleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.ok;
  } catch {
    return false;
  }
}

// hooks/vehicle/useVehicles.ts
export function useVehicles(
  organizationIdFilter: string,
  isPrivileged: boolean
) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assignments, setAssignments] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  const VITE_API_URL = import.meta.env.VITE_API_URL;

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${VITE_API_URL}/api/vehicles`);
      if (!res.ok) throw new Error("Failed to fetch vehicles");

      const data: Vehicle[] = await res.json();
      const filtered =
        isPrivileged || organizationIdFilter === ""
          ? data
          : data.filter((v) => v.organization_id === organizationIdFilter);

      setVehicles(filtered);

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) return;

      const assignmentStatusEntries = await Promise.all(
        filtered.map(async (vehicle) => {
          const status = await fetchAssignmentStatus(
            vehicle.id,
            token,
            VITE_API_URL
          );
          return [vehicle.id, status] as const;
        })
      );

      setAssignments(Object.fromEntries(assignmentStatusEntries));
    } catch (err) {
      console.error("[useVehicles] Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!organizationIdFilter && !isPrivileged) return;
    fetchVehicles();
  }, [organizationIdFilter, isPrivileged]);

  return { vehicles, assignments, loading, refetch: fetchVehicles };
}
