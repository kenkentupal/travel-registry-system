import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import { Trash } from "lucide-react";
import Button from "../UiElements/Button";
import Input from "../../components/form/input/InputField";
import { useSearch } from "../../context/SearchContext";
import PaginatedTable from "../UiElements/PaginatedTable";

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
  const [position, setPosition] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { search } = useSearch();

  const columns = [
    {
      label: "Name",
      render: (org: Organization) =>
        editId === org.id ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        ) : (
          org.name
        ),
    },
    {
      label: "Description",
      render: (org: Organization) =>
        editId === org.id ? (
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        ) : (
          org.description || "-"
        ),
    },
    {
      label: "Created At",
      render: (org: Organization) => new Date(org.created_at).toLocaleString(),
    },
    {
      label: "Actions",
      render: (org: Organization) =>
        editId === org.id ? (
          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 transition"
            >
              Save
            </button>
            <button
              onClick={cancelEditing}
              className="inline-flex items-center justify-center rounded-md bg-gray-500 px-3 py-1 text-xs font-medium text-white hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => startEditing(org)}
              className="inline-flex items-center justify-center rounded-md bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600 transition"
            >
              Edit
            </button>
            {(position === "CEO" || position === "Developer") && (
              <button
                onClick={() => handleDelete(org.id)}
                className="inline-flex items-center justify-center rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600 transition"
              >
                <Trash className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        ),
    },
  ];

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionToken = data.session?.access_token ?? null;
      setToken(sessionToken);
    };
    getSession();
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserRole();
      fetchOrganizations();
    }
  }, [token]);

  const fetchUserRole = useCallback(async () => {
    try {
      const res = await fetch(`${VITE_API_URL}/api/profiles/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch user role");
        return;
      }

      const data = await res.json();
      setPosition(data.position);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  }, [token]);

  const fetchOrganizations = useCallback(async () => {
    try {
      const res = await fetch(`${VITE_API_URL}/api/organizations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setOrgs(data);
      } else {
        console.error("Error fetching organizations");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleCreateOrganization = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user || !token) return;

      const res = await fetch(`${VITE_API_URL}/api/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, userId: user.id }),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        fetchOrganizations();
      } else {
        const error = await res.json();
        alert("Error creating organization: " + error.error);
      }
    } catch (error) {
      console.error("Error creating organization:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmDelete = confirm("Are you sure you want to delete this?");
      if (!confirmDelete || !token) return;

      const res = await fetch(`${VITE_API_URL}/api/organizations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchOrganizations();
      } else {
        const error = await res.json();
        alert("Error deleting organization: " + error.error);
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
    }
  };

  const startEditing = (org: Organization) => {
    setEditId(org.id);
    setEditName(org.name);
    setEditDescription(org.description || "");
  };

  const cancelEditing = () => {
    setEditId(null);
    setEditName("");
    setEditDescription("");
  };

  const saveEdit = async () => {
    if (!editId || !token) return;

    try {
      const res = await fetch(`${VITE_API_URL}/api/organizations/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      });

      if (res.ok) {
        cancelEditing();
        fetchOrganizations();
      } else {
        const error = await res.json();
        alert("Error updating organization: " + error.error);
      }
    } catch (error) {
      console.error("Error updating organization:", error);
    }
  };

  const filteredOrgs = orgs.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        Travel Tour Organizations
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <Input
          type="text"
          placeholder="Organization Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!!editId}
          className="h-10 w-full"
        />
        <Input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!!editId}
          className="h-10 w-full"
        />
        <Button
          onClick={handleCreateOrganization}
          disabled={!!editId}
          variant="primary"
          size="md"
          className="w-full h-10"
        >
          Add Organization
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-700 dark:text-gray-300">
          Loading organizations...
        </p>
      ) : (
        <PaginatedTable
          data={filteredOrgs}
          columns={columns}
          itemsPerPage={10}
        />
      )}
    </div>
  );
}
