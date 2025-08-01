// hooks/vehicle/useUpdateVehicleStatus.ts
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

export function useUpdateVehicleStatus() {
  const updateStatus = async (
    vehicleId: number,
    status: "Approved" | "Declined"
  ) => {
    if (!confirm(`Confirm to ${status.toLowerCase()} this vehicle?`)) return;

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return toast.error("Authentication required.");

    const VITE_API_URL = import.meta.env.VITE_API_URL;

    try {
      const res = await fetch(
        `${VITE_API_URL}/api/vehicles/${vehicleId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      toast.success(`Vehicle ${status.toLowerCase()} successfully.`);
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Update failed");
    }
  };

  return { updateStatus };
}
