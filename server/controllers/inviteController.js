// controllers/inviteController.js
import { supabase } from "../supabase/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

// Fetch invites with organization name
export const fetchInvites = async (req, res) => {
  const { data, error } = await supabase
    .from("invites")
    .select(
      `
      id,
      email,
      role,
      position,
      invite_code,
      accepted,
      organization_id,
      organizations (
        name
      )
    `
    )
    .order("created_at", { ascending: false }); // ⬅️ Sort by latest first

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.accepted || new Date(data.expires_at) < new Date()) {
    setInvalid(true);
  }

  res.json(data);
};

// Create a new invite
export const createInvite = async (req, res) => {
  const { email, role, position, organization_id } = req.body;

  if (!email || !role || !position || !organization_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const invite_code = uuidv4();
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const { error } = await supabase.from("invites").insert([
    {
      email,
      role,
      position,
      organization_id,
      invite_code,
      expires_at,
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: "Invite created", invite_code });
};
