import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

import { useVehicles } from "../../hooks/vehicle/useVehicles";
import { useOrganizations } from "../../hooks/organization/useOrganizations";
import { useUpdateVehicleStatus } from "../../hooks/vehicle/useUpdateVehicleStatus";
import { useDeleteAssignment } from "../../hooks/vehicle/useDeleteAssignment";
import { useRolePermissions } from "../../hooks/useRolePermissions.ts";
import { useUser } from "../../hooks/useUser";
import Spinner from "../../components/ui/spinner/Spinner.tsx";

import { useSearch } from "../../context/SearchContext";
import { Vehicle } from "../../types/vehicle";

import AddVehicle from "./AddVehicle";
import GenerateQR from "./GenerateQR";
import Select from "../../components/form/Select";
import PaginatedTable from "../UiElements/PaginatedTable";

export default function VehicleRegistry() {
  const [statusFilter, setStatusFilter] = useState("");
  const [organizationIdFilter, setOrganizationIdFilter] = useState("");
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [qrVehicle, setQrVehicle] = useState<Vehicle | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { updateStatus } = useUpdateVehicleStatus();
  const { deleteAssignment } = useDeleteAssignment();

  const { user } = useUser();
  const { search } = useSearch();

  const {
    isPrivileged,
    canApprove,
    canGenerateQR,
    canDeleteQR,
    canViewAllOrgs,
    canViewQR,
  } = useRolePermissions(user?.position);

  useEffect(() => {
    if (user && !isPrivileged) {
      setOrganizationIdFilter(user.organization_id);
    }
  }, [user, isPrivileged]);

  const {
    vehicles,
    assignments,
    loading: vehiclesLoading,
    refetch,
  } = useVehicles(organizationIdFilter, isPrivileged);
  const { organizations, loading: orgLoading } = useOrganizations();

  const loading = vehiclesLoading || orgLoading;

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesStatus = statusFilter
        ? vehicle.status.toLowerCase() === statusFilter.toLowerCase()
        : true;

      const matchesOrg = organizationIdFilter
        ? vehicle.organization_id === organizationIdFilter
        : true;

      const matchesSearch =
        vehicle.case_number.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.plate_number.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.vehicle_type.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesOrg && matchesSearch;
    });
  }, [vehicles, statusFilter, organizationIdFilter, search]);

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
      render: (v: Vehicle) => {
        const hasQR = assignments[v.id];
        const isApproved = v.status === "Approved";
        const isPending = v.status === "Pending";

        const canView = hasQR && canViewQR;
        const canGenerate = !hasQR && isApproved && canGenerateQR;

        return (
          <div className="flex gap-2 flex-wrap items-center">
            {isPending && canApprove && (
              <>
                <button
                  onClick={async () => {
                    if (
                      !confirm("Are you sure you want to approve this vehicle?")
                    )
                      return;
                    setActionLoading(`approve-${v.id}`);
                    await updateStatus(v.id, "Approved");
                    await refetch();
                    setActionLoading(null);
                  }}
                  className="bg-green-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1"
                >
                  {actionLoading === `approve-${v.id}` && <Spinner />}
                  Approve
                </button>

                <button
                  onClick={async () => {
                    if (
                      !confirm("Are you sure you want to decline this vehicle?")
                    )
                      return;
                    setActionLoading(`decline-${v.id}`);
                    await updateStatus(v.id, "Declined");
                    await refetch();
                    setActionLoading(null);
                  }}
                  className="bg-red-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1"
                >
                  {actionLoading === `decline-${v.id}` && <Spinner />}
                  Decline
                </button>
              </>
            )}

            {canView && (
              <Link
                to={`/vehicle/${v.id}`}
                className="bg-blue-600 text-white text-xs px-3 py-1 rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </Link>
            )}

            {canGenerate && (
              <button
                onClick={async () => {
                  if (!confirm("Generate a QR assignment?")) return;
                  setActionLoading(`generate-${v.id}`);
                  setQrVehicle(v);
                  setActionLoading(null);
                }}
                className="bg-blue-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1"
              >
                {actionLoading === `generate-${v.id}` && <Spinner />}
                Generate QR
              </button>
            )}

            {hasQR && canDeleteQR && (
              <button
                onClick={async () => {
                  if (!confirm("Delete this QR assignment?")) return;
                  setActionLoading(`delete-${v.id}`);
                  await deleteAssignment(v.id);
                  await refetch();
                  setActionLoading(null);
                }}
                className="bg-red-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1"
              >
                {actionLoading === `delete-${v.id}` && <Spinner />}
                Delete
              </button>
            )}
          </div>
        );
      },
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
          disabled={!canViewAllOrgs}
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
              onSuccess={async () => {
                await refetch(); // ✅ just refetch, no reload
                setQrVehicle(null); // ✅ close modal after success
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
