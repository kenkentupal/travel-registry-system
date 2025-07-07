import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { v4 as uuidv4 } from "uuid";

interface UserInvite {
  id: string;
  email: string;
  role: string;
  position: string; // ← added
  invite_code: string;
  accepted: boolean;
  organization_id?: string; // 👈 optional
  organizations?: {
    name: string;
  };
}

interface Organization {
  id: string;
  name: string;
}

export default function UserTable() {
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState(""); // selected org

  useEffect(() => {
    fetchInvites();
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name");
    if (error) {
      console.error("Error fetching organizations:", error.message);
    } else {
      setOrganizations(data || []);
    }
  };

  const fetchInvites = async () => {
    const { data, error } = await supabase
      .from("invites")
      .select("*, organizations(name)");

    if (error) {
      console.error("Error fetching invites:", error.message);
    } else {
      setInvites(data || []);
    }
    setLoading(false);
  };

  const handleCreateInvite = async () => {
    const code = uuidv4();

    if (!organizationId) {
      alert("Please select an organization.");
      return;
    }

    const { error } = await supabase.from("invites").insert([
      {
        email,
        invite_code: code,
        role: "user",
        position: position.trim(),
        organization_id: organizationId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ]);

    if (!error) {
      setEmail("");
      setPosition("");
      setOrganizationId("");
      fetchInvites();
    } else {
      alert("Error creating invite: " + error.message);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        User Invites
      </h2>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="email"
          placeholder="Email"
          className="border px-3 py-2 rounded w-full text-gray-800 dark:text-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="border px-3 py-2 rounded w-full text-gray-800 dark:text-white dark:bg-gray-800"
        >
          <option value="">Select Position</option>
          <option value="President">President</option>
          <option value="Member">Member</option>
          <option value="Driver">Driver</option>
        </select>

        <select
          value={organizationId}
          onChange={(e) => setOrganizationId(e.target.value)}
          className="border px-3 py-2 rounded w-full text-gray-800 dark:text-white dark:bg-gray-800"
        >
          <option value="">Select Organization</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleCreateInvite}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate Invite
        </button>
      </div>

      {loading ? (
        <p className="text-gray-700 dark:text-gray-300">Loading invites...</p>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[600px] text-sm text-left border-collapse text-gray-800 dark:text-gray-100">
            <thead>
              <tr className="text-gray-600 dark:text-gray-300 border-b">
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Position</th>
                <th className="py-2 px-3">Organization</th>
                <th className="py-2 px-3">Accepted</th>
                <th className="py-2 px-3">Invite Link</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr
                  key={invite.id}
                  className="border-b hover:bg-gray-50 dark:hover:bg-white/10"
                >
                  <td className="py-2 px-3">{invite.email}</td>
                  <td className="py-2 px-3">{invite.position}</td>
                  <td className="py-2 px-3">
                    {invite.organizations?.name ?? "N/A"}
                  </td>
                  <td className="py-2 px-3">
                    {invite.accepted ? "✅ Yes" : "❌ No"}
                  </td>
                  <td className="py-2 px-3 break-all">
                    <code className="text-blue-600">
                      {`${window.location.origin}/invite?code=${invite.invite_code}`}
                    </code>
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
