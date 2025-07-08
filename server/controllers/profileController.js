// server/controllers/organizationController.js
import { supabase } from "../supabase/supabaseClient.js";

// Fetch all organizations
export const fetchProfiles = async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
};


