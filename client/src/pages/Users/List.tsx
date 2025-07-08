import { useEffect, useState } from "react";

interface Profiles {
  id: string;
  email: string;
  position: string;
  organization_id: string;
  created_at: string;
  organizations?: {
    name: string;
  };
}

interface Organization {
  id: string;
  name: string;
}

export default function List() {
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [organizationId, setOrganizationId] = useState(""); // selected org
  const [organizations, setOrganizations] = useState<Organization[]>([]); // Stores organizations
  const [profiles, setProfiles] = useState<Profiles[]>([]); // All profiles
  const [filteredProfiles, setFilteredProfiles] = useState<Profiles[]>([]); // Filtered profiles based on search

  const VITE_API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProfiles();
    fetchOrganizations(); // Fetch organizations alongside profiles
  }, []);

  useEffect(() => {
    // Apply filtering whenever any search criteria changes
    filterProfiles();
  }, [email, position, organizationId, profiles]);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch(`${VITE_API_URL}/api/organizations`);
      if (!res.ok) throw new Error("Failed to fetch organizations");
      const data = await res.json();
      setOrganizations(data); // Set organizations to state
    } catch (error) {
      console.error("Error fetching organizations", error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${VITE_API_URL}/api/profiles`);
      if (!res.ok) throw new Error("Failed to fetch profiles");
      const data = await res.json();
      setProfiles(data);
    } catch (error) {
      console.error("Error fetching profiles", error);
    }
  };

  const filterProfiles = () => {
    const filtered = profiles.filter((profile) => {
      const matchesEmail = profile.email
        .toLowerCase()
        .includes(email.toLowerCase());
      const matchesPosition = position
        ? profile.position.toLowerCase().includes(position.toLowerCase())
        : true;
      const matchesOrganization = organizationId
        ? profile.organization_id === organizationId
        : true;

      return matchesEmail && matchesPosition && matchesOrganization;
    });
    setFilteredProfiles(filtered);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow w-full">
      <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
        Search Profiles
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <input
          type="email"
          placeholder="Search by Email"
          className="border px-4 py-2 rounded-md w-full text-gray-800 dark:text-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="border px-4 py-2 rounded-md w-full text-gray-800 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Position</option>
          <option value="President">President</option>
          <option value="Member">Member</option>
          <option value="Driver">Driver</option>
        </select>

        <select
          value={organizationId}
          onChange={(e) => setOrganizationId(e.target.value)}
          className="border px-4 py-2 rounded-md w-full text-gray-800 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Organization</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {profiles.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">Loading profiles...</p>
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
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {filteredProfiles.map((profile) => {
                  // Find the organization name based on organization_id
                  const organizationName =
                    organizations.find(
                      (org) => org.id === profile.organization_id
                    )?.name ?? "N/A";

                  return (
                    <tr
                      key={profile.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {profile.email}
                      </td>
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {profile.position}
                      </td>
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {organizationName}
                      </td>
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {new Date(profile.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
