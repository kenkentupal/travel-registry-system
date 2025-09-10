import { useEffect, useState } from "react";
import { useSearch } from "../../context/SearchContext";
import Select from "../../components/form/Select";
import { useUser } from "../../hooks/useUser";
import { supabase } from "../../supabaseClient";
import PaginatedTable from "../UiElements/PaginatedTable"; // adjust path if needed

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
        <PaginatedTable
          data={filteredProfiles}
          itemsPerPage={10}
          columns={[
            {
              label: "Email",
              render: (profile) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {profile.email}
                </span>
              ),
            },
            {
              label: "Position",
              render: (profile) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {profile.position}
                </span>
              ),
            },
            {
              label: "Organization",
              render: (profile) => {
                const orgName =
                  organizations.find(
                    (org) => org.id === profile.organization_id
                  )?.name ?? "N/A";
                return (
                  <span className="text-gray-700 dark:text-gray-300">
                    {orgName}
                  </span>
                );
              },
            },
            {
              label: "Created At",
              render: (profile) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date(profile.created_at).toLocaleString()}
                </span>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
