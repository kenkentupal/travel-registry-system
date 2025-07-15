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
