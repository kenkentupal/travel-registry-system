import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";

import AddVehicle from "./AddVehicle";
import GenerateQR from "./GenerateQR";
import Select from "../../components/form/Select";
import PaginatedTable from "../UiElements/PaginatedTable";

import { useUser } from "../../hooks/useUser";
import { useSearch } from "../../context/SearchContext";

interface Vehicle {
  id: number;
  case_number: string;
  plate_number: string;
  vehicle_type: string;
  insurance_document?: string;
  status: string;
  created_by?: string;
  organization_id: string;
}

interface Organization {
  id: string;
  name: string;
}

async function fetchAssignmentStatus(
  vehicleId: number,
  token: string,
  apiUrl: string
): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/api/qrcode/${vehicleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 404) return false;
    if (!res.ok) {
      const message = await res.text();
      console.warn(`Unexpected response for vehicle ${vehicleId}:`, message);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Error fetching QR for vehicle ${vehicleId}:`, err);
    return false;
  }
}

export default function VehicleTable() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [assignments, setAssignments] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [qrVehicle, setQrVehicle] = useState<Vehicle | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [organizationIdFilter, setOrganizationIdFilter] = useState("");

  const { user, loading: userLoading } = useUser();
  const { search } = useSearch();
  const VITE_API_URL = import.meta.env.VITE_API_URL;
  const isPrivileged = ["CEO", "Developer"].includes(user?.position || "");

  useEffect(() => {
    if (user && !isPrivileged) {
      setOrganizationIdFilter(user.organization_id);
    }
  }, [user]);

  useEffect(() => {
    if (organizationIdFilter || isPrivileged) {
      fetchVehicles();
    }
  }, [organizationIdFilter, isPrivileged]);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${VITE_API_URL}/api/vehicles`);
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const data: Vehicle[] = await res.json();

      const filteredByOrg =
        isPrivileged || organizationIdFilter === ""
          ? data
          : data.filter(
              (v: Vehicle) => v.organization_id === organizationIdFilter
            );

      setVehicles(filteredByOrg);

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) return;

      const assignmentStatusEntries = await Promise.all(
        filteredByOrg.map(async (vehicle) => {
          const status = await fetchAssignmentStatus(
            vehicle.id,
            token,
            VITE_API_URL
          );
          return [vehicle.id, status] as const;
        })
      );

      setAssignments(Object.fromEntries(assignmentStatusEntries));
    } catch (error) {
      console.error("[VehicleTable] Failed to fetch vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteAssignment = async (vehicleId: number) => {
    if (!confirm("Are you sure you want to delete this QR assignment?")) return;

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return alert("You must be logged in.");

    try {
      const res = await fetch(`${VITE_API_URL}/api/qrcode/${vehicleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete assignment");

      alert("Deleted successfully.");
      fetchVehicles();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleUpdateStatus = async (
    vehicleId: number,
    status: "Approved" | "Declined"
  ) => {
    if (!confirm(`Confirm to ${status.toLowerCase()} this vehicle?`)) return;

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return alert("Authentication required.");

    try {
      const res = await fetch(
        `${VITE_API_URL}/api/vehicles/${vehicleId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      alert(`Vehicle ${status.toLowerCase()} successfully.`);
      fetchVehicles();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesStatus = statusFilter
      ? vehicle.status.toLowerCase() === statusFilter.toLowerCase()
      : true;

    const matchesOrganization = organizationIdFilter
      ? vehicle.organization_id === organizationIdFilter
      : true;

    const matchesSearch =
      vehicle.case_number.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.plate_number.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.vehicle_type.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesOrganization && matchesSearch;
  });

  const columns = [
    { label: "Case No", render: (v: Vehicle) => v.case_number },
    { label: "Plate No", render: (v: Vehicle) => v.plate_number },
    { label: "Vehicle Type", render: (v: Vehicle) => v.vehicle_type },
    {
      label: "Organization",
      render: (v: Vehicle) =>
        organizations.find((org) => org.id === v.organization_id)?.name ??
        "N/A",
    },
    {
      label: "Insurance",
      render: (v: Vehicle) =>
        v.insurance_document ? (
          <a
            href={v.insurance_document}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline text-xs"
          >
            View
          </a>
        ) : (
          <span className="text-gray-400 italic text-xs">None</span>
        ),
    },
    {
      label: "Status",
      render: (v: Vehicle) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            v.status === "Approved"
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : v.status === "Pending"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {v.status}
        </span>
      ),
    },
    {
      label: "Actions",
      render: (v: Vehicle) =>
        v.status === "Pending" ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateStatus(v.id, "Approved")}
              className="bg-green-600 text-white text-xs px-3 py-1 rounded"
            >
              Approve
            </button>
            <button
              onClick={() => handleUpdateStatus(v.id, "Declined")}
              className="bg-red-600 text-white text-xs px-3 py-1 rounded"
            >
              Decline
            </button>
          </div>
        ) : v.status === "Approved" ? (
          assignments[v.id] ? (
            <div className="flex gap-2">
              <Link
                to={`/vehicle/${v.id}`}
                className="bg-blue-600 text-white text-xs px-3 py-1 rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </Link>
              <button
                onClick={() => handleDeleteAssignment(v.id)}
                className="bg-red-600 text-white text-xs px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ) : (
            <button
              onClick={() => setQrVehicle(v)}
              className="bg-blue-500 text-white text-xs px-3 py-1 rounded"
            >
              Generate QR
            </button>
          )
        ) : (
          <span className="text-gray-400 italic text-xs">No actions</span>
        ),
    },
  ];

  if (loading) {
    return (
      <div className="p-6 text-gray-600 dark:text-gray-300">
        Loading vehicles...
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white">
          Vehicles
        </h2>
        <button
          onClick={() => setShowAddVehicle(!showAddVehicle)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          {showAddVehicle ? "Close" : "Add Vehicle"}
        </button>
      </div>

      {showAddVehicle && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-auto px-4 pt-24 pb-12">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-white/10 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Add Vehicle
              </h3>
              <button
                onClick={() => setShowAddVehicle(false)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
              >
                &times;
              </button>
            </div>
            <AddVehicle onClose={() => setShowAddVehicle(false)} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Select
          onChange={(value) => setStatusFilter(value)}
          defaultValue=""
          placeholder="Select Status"
          options={[
            { label: "All Statuses", value: "" },
            { label: "Approved", value: "Approved" },
            { label: "Pending", value: "Pending" },
            { label: "Declined", value: "Declined" },
          ]}
        />
        <Select
          onChange={(value) => setOrganizationIdFilter(value)}
          defaultValue=""
          placeholder="Select Organization"
          value={organizationIdFilter}
          disabled={!isPrivileged}
          options={[
            { label: "All Organizations", value: "" },
            ...organizations.map((org) => ({
              label: org.name,
              value: org.id,
            })),
          ]}
        />
      </div>

      <PaginatedTable
        data={filteredVehicles}
        columns={columns}
        itemsPerPage={10}
      />

      {qrVehicle && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-auto px-4 pt-24 pb-12">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-white/10 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Generate QR
              </h3>
              <button
                onClick={() => setQrVehicle(null)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
              >
                &times;
              </button>
            </div>
            <GenerateQR
              vehicleId={qrVehicle.id}
              onClose={() => setQrVehicle(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
