import { useEffect, useState } from "react";

interface UserInvite {
  id: string;
  email: string;
  role: string;
  position: string;
  invite_code: string;
  accepted: boolean;
  organization_id?: string;
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

  const VITE_API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchInvites();
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch(`${VITE_API_URL}/api/organizations`);
      if (!res.ok) throw new Error("Failed to fetch organizations");
      const data = await res.json();
      setOrganizations(data);
    } catch (error) {
      console.error("Error fetching organizations", error);
    }
  };

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${VITE_API_URL}/api/invites`);
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setInvites(data);
    } catch (err) {
      console.error("Error fetching invites", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvite = async () => {
    if (!organizationId) {
      alert("Please select an organization.");
      return;
    }

    const res = await fetch(`${VITE_API_URL}/api/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        role: "user",
        position: position.trim(),
        organization_id: organizationId,
      }),
    });

    if (res.ok) {
      setEmail("");
      setPosition("");
      setOrganizationId("");
      fetchInvites();
    } else {
      const error = await res.json();
      alert("Error creating invite: " + error.error);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow w-full">
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
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
          <div className="max-w-full">
            <table className="w-full text-sm text-left border-collapse text-gray-800 dark:text-gray-100">
              <thead>
                <tr className="text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/10">
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Position
                  </th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Organization
                  </th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Accepted
                  </th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Invite Link
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {invites.map((invite) => (
                  <tr
                    key={invite.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {invite.email}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {invite.position}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {invite.organizations?.name ?? "N/A"}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {invite.accepted ? (
                        <span className="text-green-500">✅ Yes</span>
                      ) : (
                        <span className="text-red-500">❌ No</span>
                      )}
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                      <a
                        href={`${window.location.origin}/invite?code=${invite.invite_code}`}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {`${window.location.origin}/invite?code=${invite.invite_code}`}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
