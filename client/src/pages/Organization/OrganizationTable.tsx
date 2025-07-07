import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

interface Organization {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export default function OrganizationTable() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, description, created_by, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching organizations:", error.message);
    } else {
      setOrgs(data || []);
    }
    setLoading(false);
  };

  const handleCreateOrganization = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be signed in to create an organization.");
      return;
    }

    const { error } = await supabase.from("organizations").insert([
      {
        name: name.trim(),
        description: description.trim(),
        created_by: user.id, // 👈 MUST be set!
      },
    ]);

    if (!error) {
      setName("");
      setDescription("");
      fetchOrganizations();
    } else {
      alert("Error creating organization: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", id);
    if (!error) fetchOrganizations();
    else alert("Error deleting: " + error.message);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        Travel Tour Organizations
      </h2>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Organization Name"
          className="border px-3 py-2 rounded w-full text-gray-800 dark:text-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          className="border px-3 py-2 rounded w-full text-gray-800 dark:text-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          onClick={handleCreateOrganization}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Organization
        </button>
      </div>

      {loading ? (
        <p>Loading organizations...</p>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[600px] text-sm border-collapse table-fixed text-gray-800 dark:text-gray-100">
            <thead>
              <tr className="text-gray-600 dark:text-gray-300 border-b">
                <th className="py-2 px-3 text-left w-[200px]">Name</th>
                <th className="py-2 px-3 text-left">Description</th>
                <th className="py-2 px-3 text-left">Created At</th>
                <th className="py-2 px-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr
                  key={org.id}
                  className="border-b hover:bg-gray-50 dark:hover:bg-white/10"
                >
                  <td className="py-2 px-3 text-left">{org.name}</td>
                  <td className="py-2 px-3 text-left truncate max-w-[200px]">
                    {org.description || "-"}
                  </td>
                  <td className="py-2 px-3 text-left text-xs">
                    {new Date(org.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-left">
                    <button
                      onClick={() => handleDelete(org.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
