import { createSupabaseClient } from "../supabase/supabaseClient.js";
import { supabaseAdmin } from "../supabase/supabaseAdmin.js";

export const getCurrentUserProfile = async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "Missing token" });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return res.status(500).json({ error: "Profile not found" });
  }

  // Merge auth data + profile
  res.json({
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
    ...profile,
  });
};

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

export const fetchDriversByOrganization = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createSupabaseClient(token);
  const { orgId } = req.params;

  // Step 1: Get all "Driver" profiles from the same organization
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, position, organization_id")
    .eq("position", "Driver")
    .eq("organization_id", orgId);

  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }

  // Step 2: Use supabaseAdmin to get display_name from Auth
  const enrichedDrivers = [];

  for (const profile of profiles) {
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(profile.id); // <-- now using admin

    if (userError) {
      console.error("Auth fetch failed for user:", profile.id);
      continue;
    }

    const displayName =
      userData.user.user_metadata?.display_name ||
      `${userData.user.user_metadata?.first_name || ""} ${
        userData.user.user_metadata?.last_name || ""
      }`.trim() ||
      "No name set";

    enrichedDrivers.push({
      id: profile.id,
      display_name: displayName || "No name set",
    });
  }

  return res.json(enrichedDrivers);
};

export const updateAvatar = async (req, res) => {
  const { user_id, avatar_url } = req.body;

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url })
    .eq("user_id", user_id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Avatar updated successfully" });
};
