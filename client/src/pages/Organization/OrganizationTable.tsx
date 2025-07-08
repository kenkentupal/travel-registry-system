import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient"; // Adjust the import path as needed
const user = supabase.auth.getUser(); // async, so handle properly

interface Organization {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
}

const VITE_API_URL = import.meta.env.VITE_API_URL;

export default function OrganizationTable() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  // For editing
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    const res = await fetch(`${VITE_API_URL}/api/organizations`);
    if (res.ok) {
      const data = await res.json();
      setOrgs(data);
    } else {
      console.error("Error fetching organizations");
    }
    setLoading(false);
  };

  const handleCreateOrganization = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;

    const res = await fetch(`${VITE_API_URL}/api/organizations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, userId }),
    });

    if (res.ok) {
      setName("");
      setDescription("");
      fetchOrganizations();
    } else {
      const error = await res.json();
      alert("Error creating organization: " + error.error);
    }
  };

  // Start editing: fill edit fields and set editId
  const startEditing = (org: Organization) => {
    setEditId(org.id);
    setEditName(org.name);
    setEditDescription(org.description || "");
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditId(null);
    setEditName("");
    setEditDescription("");
  };

  // Save edited org
  const saveEdit = async () => {
    if (!editId) return;

    const res = await fetch(`${VITE_API_URL}/api/organizations/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDescription }),
    });

    if (res.ok) {
      cancelEditing();
      fetchOrganizations();
    } else {
      const error = await res.json();
      alert("Error updating organization: " + error.error);
    }
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
          disabled={!!editId} // disable while editing
        />
        <input
          type="text"
          placeholder="Description"
          className="border px-3 py-2 rounded w-full text-gray-800 dark:text-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!!editId}
        />
        <button
          onClick={handleCreateOrganization}
          disabled={!!editId}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Add Organization
        </button>
      </div>

      {loading ? (
        <p className="text-gray-700 dark:text-gray-300">
          Loading organizations...
        </p>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[600px] text-sm border-collapse table-fixed text-gray-800 dark:text-gray-100">
            <thead>
              <tr className="text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/10">
                <th className="py-2 px-3 text-left w-[200px]">Name</th>
                <th className="py-2 px-3 text-left">Description</th>
                <th className="py-2 px-3 text-left">Created At</th>
                <th className="py-2 px-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {orgs.map((org) => (
                <tr
                  key={org.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                    {editId === org.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      org.name
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                    {editId === org.id ? (
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      org.description || "-"
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300 text-xs">
                    {new Date(org.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    {editId === org.id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="text-green-600 hover:underline mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-600 hover:underline"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEditing(org)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    )}
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
