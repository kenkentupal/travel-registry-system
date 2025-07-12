import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import Select from "../UiElements/Select";
import Textbox from "../UiElements/Textbox";
import Button from "../UiElements/Button"; // Importing the custom Button component

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
  const [organizationId, setOrganizationId] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const fetchInvites = async () => {
    const { data } = await supabase
      .from("invites")
      .select("*, organizations(name)")
      .order("created_at", { ascending: false });

    setInvites(data || []);
  };

  const fetchOrganizations = async () => {
    const { data } = await supabase.from("organizations").select("*");
    setOrganizations(data || []);
  };

  const handleCreateInvite = async () => {
    // Validate that email, position, and organization are provided
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
    setOrganizationId("");
    fetchInvites();
  };

  useEffect(() => {
    fetchInvites();
    fetchOrganizations();
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow w-full">
      <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
        Invite Users
      </h2>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Textbox
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full"
        />

        {/* Position Select */}
        <Select
          label="Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          options={[
            { label: "Select Position", value: "" },
            { label: "President", value: "President" },
            { label: "Member", value: "Member" },
            { label: "Driver", value: "Driver" },
          ]}
          className="w-full"
        />

        {/* Organization Select */}
        <Select
          label="Organization"
          value={organizationId}
          onChange={(e) => setOrganizationId(e.target.value)}
          options={[
            { label: "Select Organization", value: "" },
            ...organizations.map((org) => ({
              label: org.name,
              value: org.id,
            })),
          ]}
          className="w-full"
        />

        {/* Custom Button for "Generate Invite" */}
        <Button
          onClick={handleCreateInvite}
          variant="primary"
          size="md"
          className="w-full h-10 mt-auto"
        >
          Generate Invite
        </Button>
      </div>

      {/* Invitations Table */}
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
            {invites.map((invite) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
