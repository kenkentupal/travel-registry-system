import { useEffect, useState } from "react";
import AddVehicle from "./AddVehicle";
import { Link } from "react-router-dom";
import Select from "../UiElements/Select";

interface Vehicle {
  id: number;
  case_number: string;
  plate_number: string;
  vehicle_type: string;
  contact_number: string;
  notes?: string;
  insurance_document?: string;
  status: string;
  travel_company: string;
  driver_name: string;
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

  const VITE_API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch(`${VITE_API_URL}/api/vehicles`);
        if (!res.ok) throw new Error("Failed to fetch vehicles");
        const data = await res.json();
        setVehicles(data);
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

    fetchOrganizations();
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesStatus = statusFilter
      ? vehicle.status.toLowerCase() === statusFilter.toLowerCase()
      : true;

    const matchesOrganization = organizationIdFilter
      ? vehicle.organization_id === organizationIdFilter
      : true;

    return matchesStatus && matchesOrganization;
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
        <div className="pt-4">
          <AddVehicle onClose={() => setShowAddVehicle(false)} />
        </div>
      )}

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { label: "All Statuses", value: "" },
            { label: "Approved", value: "Approved" },
            { label: "Pending", value: "Pending" },
            { label: "Declined", value: "Declined" },
          ]}
        />

        <Select
          label="Organization"
          value={organizationIdFilter}
          onChange={(e) => setOrganizationIdFilter(e.target.value)}
          options={[
            { label: "All Organizations", value: "" },
            ...organizations.map((org) => ({
              label: org.name,
              value: org.id,
            })),
          ]}
        />
      </div>

      {filteredVehicles.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">No vehicles found.</p>
      ) : (
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
                    "Driver",
                    "Contact No",
                    "Notes",
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
                {filteredVehicles.map((vehicle) => {
                  const organizationName =
                    organizations.find(
                      (org) => org.id === vehicle.organization_id
                    )?.name ?? "N/A";

                  return (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">{vehicle.case_number}</td>
                      <td className="px-5 py-4">{vehicle.plate_number}</td>
                      <td className="px-5 py-4">{vehicle.vehicle_type}</td>
                      <td className="px-5 py-4">{organizationName}</td>
                      <td className="px-5 py-4">{vehicle.driver_name}</td>
                      <td className="px-5 py-4">
                        {vehicle.contact_number || "-"}
                      </td>
                      <td className="px-5 py-4">{vehicle.notes || "-"}</td>
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
                      <td className="px-5 py-4">
                        <Link
                          to={`/vehicle/${vehicle.id}`}
                          className="text-blue-600 hover:underline text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </Link>
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
