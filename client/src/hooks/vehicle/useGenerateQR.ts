// hooks/vehicle/useGenerateQR.ts
import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { Assignment } from "../../types/assignment";

interface GenerateFormData {
  destination: string;
  purpose: string;
  driver_id: string;
}

export function useGenerateQR(vehicleId: number, onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async (formData: GenerateFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      if (!token) throw new Error("Unauthorized: No token found.");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/qrcode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, vehicle_id: vehicleId }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "QR generation failed");

      const assignmentRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/qrcode/${vehicleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const assignmentData = await assignmentRes.json();
      if (!assignmentRes.ok) {
        throw new Error(assignmentData.error || "Failed to fetch assignment.");
      }

      setAssignment(assignmentData);
      if (onSuccess) onSuccess(); // ✅ triggers refetch
      return true;
    } catch (err: any) {
      console.error("QR generation error:", err.message);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, assignment, error };
}
