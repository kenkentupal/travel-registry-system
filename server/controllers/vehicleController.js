const supabase = require("../supabase/supabaseClient");

// GET /vehicles
exports.getVehicles = async (req, res) => {
  const { data, error } = await supabase
    .from("vehicles")
    .select("org")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
