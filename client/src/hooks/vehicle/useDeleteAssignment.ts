// hooks/vehicle/useDeleteAssignment.ts
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

export function useDeleteAssignment() {
  const deleteAssignment = async (vehicleId: number) => {
    if (!confirm("Are you sure you want to delete this QR assignment?")) return;

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return toast.error("You must be logged in.");

    const VITE_API_URL = import.meta.env.VITE_API_URL;

    try {
      const res = await fetch(`${VITE_API_URL}/api/qrcode/${vehicleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete assignment");

      toast.success("QR assignment deleted.");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed.");
    }
  };

  return { deleteAssignment };
}
