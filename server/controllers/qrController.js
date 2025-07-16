import { createSupabaseClient } from "../supabase/supabaseClient.js";
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
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createSupabaseClient(token);
  const { vehicleId } = req.params;

  try {
    const { data, error } = await supabase
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

    // Fetch driver display_name from Supabase Auth
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(assignment.driver_id);

    if (userError) {
      console.warn("⚠️ Failed to fetch driver info:", userError.message);
    }

    const displayName =
      userData?.user?.user_metadata?.display_name ||
      `${userData?.user?.user_metadata?.first_name || ""} ${
        userData?.user?.user_metadata?.last_name || ""
      }`.trim() ||
      "No name set";

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
