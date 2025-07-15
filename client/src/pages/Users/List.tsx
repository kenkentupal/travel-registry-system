import { useEffect, useState } from "react";
import { useSearch } from "../../context/SearchContext";
import Select from "../../components/form/Select";
import { useUser } from "../../hooks/useUser";
import { supabase } from "../../supabaseClient";

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
  const [position, setPosition] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [profiles, setProfiles] = useState<Profiles[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profiles[]>([]);

  const { user, loading: userLoading } = useUser();
  const { search } = useSearch();
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  const isPrivileged = ["CEO", "Developer"].includes(user?.position || "");

  useEffect(() => {
    if (!userLoading && user) {
      if (!isPrivileged) {
        setOrganizationId(user.organization_id);
      }
      fetchOrganizations();
    }
  }, [user]);

  useEffect(() => {
    if (organizationId || isPrivileged) {
      fetchProfiles();
    }
  }, [organizationId, isPrivileged]);

  useEffect(() => {
    filterProfiles();
  }, [search, position, organizationId, profiles]);

  const fetchOrganizations = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${VITE_API_URL}/api/organizations`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch organizations");
      const data = await res.json();
      setOrganizations(data);
    } catch (error) {
      console.error("Error fetching organizations", error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const url = isPrivileged
        ? `${VITE_API_URL}/api/profiles`
        : `${VITE_API_URL}/api/profiles?org_id=${organizationId}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await res.json();
      setProfiles(data);
    } catch (error) {
      console.error("Error fetching profiles", error);
    }
  };

  const filterProfiles = () => {
    const filtered = profiles.filter((profile) => {
      const matchesSearch =
        profile.email.toLowerCase().includes(search.toLowerCase()) ||
        profile.position.toLowerCase().includes(search.toLowerCase());

      const matchesPosition = position
        ? profile.position.toLowerCase().includes(position.toLowerCase())
        : true;

      const matchesOrganization = organizationId
        ? profile.organization_id === organizationId
        : true;

      return matchesSearch && matchesPosition && matchesOrganization;
    });

    setFilteredProfiles(filtered);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow w-full">
      <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
        Search Profiles
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Select
          onChange={(value) => setPosition(value)}
          placeholder="Select Position"
          defaultValue=""
          options={[
            { label: "President", value: "President" },
            { label: "Member", value: "Member" },
            { label: "Driver", value: "Driver" },
          ]}
          className="w-full"
        />

        <Select
          onChange={(value) => setOrganizationId(value)}
          placeholder="Select Organization"
          defaultValue=""
          value={organizationId}
          options={organizations.map((org) => ({
            label: org.name,
            value: org.id,
          }))}
          className="w-full"
          disabled={!isPrivileged}
        />
      </div>

      {profiles.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">Loading profiles...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
          <div className="max-w-full">
            <table className="w-full text-sm text-left border-collapse text-gray-800 dark:text-gray-100">
              <thead>
                <tr className="text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/10">
                  <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </th>
                  <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                    Position
                  </th>
                  <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                    Organization
                  </th>
                  <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {filteredProfiles.length > 0 ? (
                  filteredProfiles.map((profile) => {
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
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center text-gray-400 py-6 dark:text-white/50"
                    >
                      No profiles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
