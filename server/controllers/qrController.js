import { createSupabaseClient, supabase } from "../supabase/supabaseClient.js";
import { supabaseAdmin } from "../supabase/supabaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

export const generateQRCode = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createSupabaseClient(token);
  const { vehicle_id, driver_id, destination, purpose } = req.body;

  if (!vehicle_id || !driver_id || !destination || !purpose) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("organization_id")
    .eq("id", vehicle_id)
    .single();

  if (vehicleError || !vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  const { data, error } = await supabase
    .from("vehicle_assignments")
    .insert([
      {
        id: uuidv4(),
        vehicle_id,
        driver_id,
        destination,
        notes: purpose,
        departure_time: new Date().toISOString(),
        generated_by: user.id,
        organization_id: vehicle.organization_id,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res
    .status(201)
    .json({ message: "QR assignment generated", assignment: data });
};

export const getVehicleAssignment = async (req, res) => {
  const { vehicleId } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from("vehicle_assignments")
      .select(
        `
        *,
        vehicles(case_number, plate_number, vehicle_type, status),
        organizations(name)
      `
      )
      .eq("vehicle_id", vehicleId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No assignment found" });
    }

    const assignment = data[0];

    // Look up display name from Supabase Auth (admin access)
    let displayName = "Unknown driver";
    try {
      const { data: userData, error: userError } =
        await supabaseAdmin.auth.admin.getUserById(assignment.driver_id);

      if (!userError && userData?.user) {
        const metadata = userData.user.user_metadata;
        displayName =
          metadata?.display_name ||
          `${metadata?.first_name || ""} ${metadata?.last_name || ""}`.trim() ||
          "No name set";
      }
    } catch (err) {
      console.warn("⚠️ Failed to fetch driver display name");
    }

    return res.status(200).json({
      ...assignment,
      profiles: {
        display_name: displayName,
      },
    });
  } catch (err) {
    console.error("🚨 Supabase error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteVehicleAssignment = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createSupabaseClient(token);
  const { vehicleId } = req.params;

  try {
    // Find latest assignment for the vehicle
    const { data: assignment, error: fetchError } = await supabase
      .from("vehicle_assignments")
      .select("id, generated_by")
      .eq("vehicle_id", vehicleId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !assignment)
      return res.status(404).json({ error: "Assignment not found" });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (assignment.generated_by !== user.id)
      return res.status(403).json({ error: "Forbidden" });

    const { error: deleteError } = await supabase
      .from("vehicle_assignments")
      .delete()
      .eq("id", assignment.id);

    if (deleteError) throw deleteError;

    return res.status(200).json({ message: "Assignment deleted" });
  } catch (err) {
    console.error("Error deleting assignment:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
