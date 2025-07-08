import { supabase } from "../supabase/supabaseClient.js"; // <-- wrong here

export const getVehicles = async (req, res) => {
  const { data, error } = await supabase
    .from("vehicles")
    .select("org")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
