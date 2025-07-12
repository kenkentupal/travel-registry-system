import { supabase, createSupabaseClient } from "../supabase/supabaseClient.js";
import { supabaseAdmin } from "../supabase/supabaseAdmin.js";

// Fetch all organizations
export const fetchProfiles = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createSupabaseClient(token);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

// server/controllers/profileController.js
export const updateUserMetadata = async (req, res) => {
  const { userId, first_name, last_name } = req.body;

  if (!userId || !first_name || !last_name) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      first_name,
      last_name,
      display_name: `${first_name} ${last_name}`,
    },
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: "User metadata updated successfully" });
};
