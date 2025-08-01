// hooks/vehicle/useVehicleById.ts
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Vehicle } from "../../types/vehicle";

export function useVehicleById(vehicleId: number) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/vehicles/${vehicleId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      if (res.ok) setVehicle(result);
      else console.error("Failed to fetch vehicle:", result.error);
    };

    fetchVehicle();
  }, [vehicleId]);

  return vehicle;
}
