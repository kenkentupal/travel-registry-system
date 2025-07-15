import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import Select from "../../components/form/Select";
import Button from "../UiElements/Button";
import Input from "../../components/form/input/InputField";
import { useUser } from "../../hooks/useUser";
import { useSearch } from "../../context/SearchContext";
import { useLocation } from "react-router";

interface UserInvite {
  id: string;
  email: string;
  role: string;
  position: string;
  invite_code: string;
  accepted: boolean;
  organization_id?: string;
}

interface Organization {
  id: string;
  name: string;
}

export default function UserTable() {
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const { user, loading: userLoading } = useUser();
  const [organizationId, setOrganizationId] = useState<string>("");
  const { search } = useSearch();
  const { setSearch } = useSearch();
  const location = useLocation();

  const isPrivileged = ["CEO", "Developer"].includes(user?.position || "");

  useEffect(() => {
    return () => {
      if (location.pathname === "/user-invites") {
        setSearch("");
      }
    };
  }, []);

  const fetchInvites = async () => {
    if (!user) return;

    let query = supabase
      .from("invites")
      .select("*, organizations(name)")
      .order("created_at", { ascending: false });

    if (!isPrivileged) {
      query = query.eq("organization_id", user.organization_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching invites:", error.message);
      return;
    }

    setInvites(data || []);
  };

  const fetchOrganizations = async () => {
    const { data } = await supabase.from("organizations").select("*");
    setOrganizations(data || []);
  };

  const handleCreateInvite = async () => {
    if (!email || !position || !organizationId) {
      alert("Please select all fields: Organization, Position, and Email");
      return;
    }

    const code = crypto.randomUUID();
    await supabase.from("invites").insert([
      {
        email,
        position,
        invite_code: code,
        organization_id: organizationId,
      },
    ]);

    setEmail("");
    setPosition("");
    if (!isPrivileged) {
      setOrganizationId(user?.organization_id || "");
    } else {
      setOrganizationId("");
    }

    fetchInvites();
  };

  const filteredInvites = invites.filter((invite) =>
    invite.email.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (user) {
      if (!isPrivileged) {
        setOrganizationId(user.organization_id);
      }
      fetchInvites();
    }
  }, [user]);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow w-full">
      <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
        Invite Users
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="w-full">
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div className="w-full">
          <Select
            onChange={(value) => setPosition(value)}
            options={[
              { label: "President", value: "President" },
              { label: "Member", value: "Member" },
              { label: "Driver", value: "Driver" },
            ]}
            className="mt-1"
            placeholder="Select Position"
            defaultValue=""
          />
        </div>

        <Select
          onChange={(value) => setOrganizationId(value)}
          options={organizations.map((org) => ({
            label: org.name,
            value: org.id,
          }))}
          value={organizationId}
          className="mt-1"
          placeholder="Select Organization"
          disabled={!isPrivileged}
        />

        <Button
          onClick={handleCreateInvite}
          variant="primary"
          size="md"
          className="w-full h-10 mt-auto"
        >
          Generate Invite
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
        <table className="w-full text-sm text-left border-collapse text-gray-800 dark:text-gray-100">
          <thead>
            <tr className="text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/10">
              <th className="py-2 px-3 text-left font-medium text-gray-500 dark:text-gray-400">
                Email
              </th>
              <th className="py-2 px-3 text-left font-medium text-gray-500 dark:text-gray-400">
                Position
              </th>
              <th className="py-2 px-3 text-left font-medium text-gray-500 dark:text-gray-400">
                Organization
              </th>
              <th className="py-2 px-3 text-left font-medium text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="py-2 px-3 text-left font-medium text-gray-500 dark:text-gray-400">
                Invite Link
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/10">
            {filteredInvites.length > 0 ? (
              filteredInvites.map((invite) => (
                <tr
                  key={invite.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 break-words">{invite.email}</td>
                  <td className="px-5 py-4 break-words">{invite.position}</td>
                  <td className="px-5 py-4 break-words">
                    {organizations.find(
                      (org) => org.id === invite.organization_id
                    )?.name ?? "N/A"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        invite.accepted
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {invite.accepted ? "Accepted" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-4 break-words">
                    {invite.accepted ? (
                      <span className="text-gray-400 italic">Used</span>
                    ) : (
                      <a
                        href={`${window.location.origin}/invite?code=${invite.invite_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {`${window.location.origin}/invite?code=${invite.invite_code}`}
                      </a>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  No invites found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
