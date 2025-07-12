import { supabase } from "../supabase/supabaseClient.js"; // <-- wrong here

export const fetchVehicles = async (req, res) => {
  const { data, error } = await supabase
    .from("vehicles")
    .select(
      `
      id, case_number, plate_number, vehicle_type, driver_name,
      contact_number, notes, insurance_document, created_at, status,
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
