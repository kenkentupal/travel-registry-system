import { createSupabaseClient } from "../supabase/supabaseClient.js";
import { supabase } from "../supabase/supabaseClient.js";

export const fetchOrganizations = async (req, res) => {
  // No token needed for public fetch
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, description, created_by, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
};

export const createOrganization = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createSupabaseClient(token);

  const { name, description } = req.body;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Organization name is required" });
  }

  const { error } = await supabase.from("organizations").insert([
    {
      name: name.trim(),
      description: description?.trim() || null,
      created_by: user.id,
    },
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: "Organization created successfully" });
};

export const deleteOrganization = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createSupabaseClient(token);

  const { id } = req.params;

  const { error } = await supabase.from("organizations").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: "Organization deleted successfully" });
};

export const updateOrganization = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createSupabaseClient(token);

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

export const getOrganizationById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, description, created_by, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Organization not found" });
  }

  res.json(data);
};
