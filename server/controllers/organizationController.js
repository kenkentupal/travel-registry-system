// server/controllers/organizationController.js
import { supabase } from "../supabase/supabaseClient.js";

// Fetch all organizations
export const fetchOrganizations = async (req, res) => {
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, description, created_by, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
};

// Create new organization
export const createOrganization = async (req, res) => {
  const { name, description, userId } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Organization name is required" });
  }

  const { error } = await supabase.from("organizations").insert([
    {
      name: name.trim(),
      description: description?.trim() || null,
      created_by: userId,
    },
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json({ message: "Organization created successfully" });
};

// Delete organization by ID
export const deleteOrganization = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("organizations").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ message: "Organization deleted successfully" });
};

export const updateOrganization = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Organization name is required" });
  }

  const { error } = await supabase
    .from("organizations")
    .update({
      name: name.trim(),
      description: description?.trim() || null,
    })
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: "Organization updated successfully" });
};
