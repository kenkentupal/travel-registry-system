import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AddVehicle from "./AddVehicle";
import Select from "../../components/form/Select";
import { useUser } from "../../hooks/useUser";
import { useSearch } from "../../context/SearchContext";
import GenerateQR from "./GenerateQR"; // ⬅️ make sure this is imported

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

export default function VehicleTable() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [organizationIdFilter, setOrganizationIdFilter] = useState("");
  const { search } = useSearch();
  const { user, loading: userLoading } = useUser();
  const [qrVehicle, setQrVehicle] = useState<Vehicle | null>(null);

  const VITE_API_URL = import.meta.env.VITE_API_URL;
  const isPrivileged = ["CEO", "Developer"].includes(user?.position || "");

  useEffect(() => {
    if (user && !isPrivileged) {
      setOrganizationIdFilter(user.organization_id);
    }
  }, [user]);

  useEffect(() => {
    if (organizationIdFilter || isPrivileged) fetchVehicles();
  }, [organizationIdFilter, isPrivileged]);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${VITE_API_URL}/api/vehicles`);
      if (!res.ok) throw new Error("Failed to fetch vehicles");

      const data = await res.json();

      const filteredByOrg =
        isPrivileged || organizationIdFilter === ""
          ? data
          : data.filter(
              (v: Vehicle) => v.organization_id === organizationIdFilter
            );

      setVehicles(filteredByOrg);
    } catch (error) {
      console.error("Error fetching vehicles", error);
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
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          {showAddVehicle ? "Close" : "Add Vehicle"}
        </button>
      </div>

      {showAddVehicle && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-auto px-4 pt-24 pb-12">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-white/10 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white"></h3>
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

      {/* FILTERS */}
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
          placeholder="Select Organization"
          defaultValue=""
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

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
        <div className="max-w-full">
          <table className="w-full text-sm text-left border-collapse text-gray-800 dark:text-gray-100">
            <thead>
              <tr className="text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/10">
                {[
                  "Case No",
                  "Plate No",
                  "Vehicle Type",
                  "Organization",
                  "Insurance Document",
                  "Status",
                  "QR Code",
                ].map((header) => (
                  <th
                    key={header}
                    className="py-2 px-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => {
                  const organizationName =
                    organizations.find(
                      (org) => org.id === vehicle.organization_id
                    )?.name || "N/A";

                  return (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">{vehicle.case_number}</td>
                      <td className="px-5 py-4">{vehicle.plate_number}</td>
                      <td className="px-5 py-4">{vehicle.vehicle_type}</td>
                      <td className="px-5 py-4">{organizationName}</td>
                      <td className="px-5 py-4">
                        {vehicle.insurance_document ? (
                          <a
                            href={vehicle.insurance_document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            vehicle.status === "Approved"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : vehicle.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 space-y-1">
                        <Link
                          to={`/vehicle/${vehicle.id}`}
                          className="block text-sm text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => setQrVehicle(vehicle)}
                          className="block text-sm text-blue-600 hover:underline"
                        >
                          Generate QR
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center text-gray-400 py-6 dark:text-white/50"
                  >
                    No vehicles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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
