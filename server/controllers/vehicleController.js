import { supabase } from "../supabase/supabaseClient.js";
import { createSupabaseClient } from "../supabase/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const addVehicle = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createSupabaseClient(token); // scoped per user

  try {
    const { body } = req;
    const file = req.file;
    let insuranceUrl = null;

    // ✅ Validate user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // ✅ Check required fields
    const requiredFields = [
      "case_number",
      "plate_number",
      "vehicle_type",
      "organization_id",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }

    // ✅ Upload file if present
    if (file) {
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("insurance-docs")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        return res.status(500).json({ error: uploadError.message });
      }

      const { data: publicUrlData } = supabase.storage
        .from("insurance-docs")
        .getPublicUrl(fileName);

      insuranceUrl = publicUrlData.publicUrl;
    }

    // ✅ Insert vehicle
    const { error } = await supabase.from("vehicles").insert([
      {
        ...body,
        status: "Pending",
        insurance_document: insuranceUrl,
        id: uuidv4(),
        created_by: user.id,
      },
    ]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: "Vehicle added successfully." });
  } catch (err) {
    console.error("Vehicle Add Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
export const fetchVehicles = async (req, res) => {
  const { data, error } = await supabase
    .from("vehicles")
    .select(
      `
      id, case_number, plate_number, vehicle_type, 
      insurance_document, created_at, status,
      organization_id, organizations(name)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase Error:", error.message); // Optional for debug
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};
export const fetchVehicleById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("vehicles")
    .select(
      `
  id, case_number, plate_number, vehicle_type,
  insurance_document, created_at, status,
  organization_id, organizations(name)
`
    )

    .eq("id", id)
    .single();

  if (error) {
    console.error("FetchVehicleById Error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};
export const updateVehicleStatus = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createSupabaseClient(token);
  const { vehicleId } = req.params;
  const { status } = req.body;

  if (!["Approved", "Declined"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const { error } = await supabase
      .from("vehicles")
      .update({ status })
      .eq("id", vehicleId);

    if (error) throw error;

    return res
      .status(200)
      .json({ message: `Vehicle status updated to ${status}` });
  } catch (err) {
    console.error("Status update failed:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const trackVehicleScan = async (req, res) => {
  const { id: vehicleId } = req.params;

  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    return res
      .status(200)
      .json({ message: "Scan skipped (authenticated user)" });
  }

  try {
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id")
      .eq("id", vehicleId)
      .single();

    if (vehicleError || !vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Get real client IP
    const ip =
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket.remoteAddress ||
      null;

    await supabase.from("vehicle_scans").insert([
      {
        vehicle_id: vehicleId,
        ip_address: ip,
        user_agent: req.headers["user-agent"] || null,
      },
    ]);

    return res.status(200).json({ message: "Scan recorded" });
  } catch (err) {
    console.error("❌ Error recording scan:", err.message);
    return res.status(500).json({ error: "Failed to track scan" });
  }
};

export const getVehicleScansByMonth = async (req, res) => {
  const { organizationId } = req.query;

  try {
    let query = supabase.from("vehicle_scans").select(`
    id,
    scanned_at,
    vehicle_id,
    vehicles:vehicle_id!inner (
      organization_id
    )
  `);

    if (organizationId) {
      query = query.eq("vehicles.organization_id", organizationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Supabase error:", error);
      throw error;
    }

    const counts = Array(12).fill(0); // Jan = 0

    data.forEach((scan) => {
      const scannedAt = new Date(scan.scanned_at);
      if (!isNaN(scannedAt.getTime())) {
        const month = scannedAt.getMonth(); // 0–11
        counts[month]++;
      } else {
        console.warn("❌ Invalid date:", scan.scanned_at);
      }
    });

    res.json({ counts });
  } catch (err) {
    console.error("❌ Error fetching scan stats:", err.message);
    res.status(500).json({ error: "Failed to fetch scan data" });
  }
};
