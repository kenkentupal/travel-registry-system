import { useEffect } from "react";
import { useFormState } from "../../hooks/useFormState"; // We create this below
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { useVehicleById } from "../../hooks/vehicle/useVehicleById";
import { useOrganizationAndDrivers } from "../../hooks/driver/useOrganizationAndDrivers";
import { useGenerateQR } from "../../hooks/vehicle/useGenerateQR";
import toast from "react-hot-toast";

type GenerateQRProps = {
  onClose: () => void;
  vehicleId: number;
  onSuccess?: () => void; // 👈 add this
};

export default function GenerateQR({
  onClose,
  vehicleId,
  onSuccess,
}: GenerateQRProps) {
  const [formData, handleChange, setFormData] = useFormState({
    destination: "",
    purpose: "",
    driver_id: "",
  });

  const vehicle = useVehicleById(vehicleId);
  const { organizationName, drivers } = useOrganizationAndDrivers(
    vehicle?.organization_id
  );
  const { generate, loading, assignment } = useGenerateQR(
    vehicleId,
    handleSuccess
  );

  function handleSuccess() {
    if (onSuccess) {
      onSuccess();
    }
  }

  const handleSubmit = async () => {
    if (!formData.driver_id || !formData.destination || !formData.purpose) {
      toast.error("Please complete all fields.");
      return;
    }

    const result = await generate(formData);
    if (result) {
      toast.success("QR code generated successfully!");
      setFormData({ destination: "", purpose: "", driver_id: "" });
    } else {
      toast.error("Failed to generate QR code.");
    }
  };

  if (!vehicle)
    return <p className="text-sm text-gray-500">Loading vehicle data...</p>;
  if (drivers.length === 0 && !assignment)
    return <p className="text-sm text-gray-500">Loading drivers...</p>;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-6 space-y-6">
      <div className="bg-gray-50 dark:bg-white/[0.05] p-4 rounded-lg border border-gray-200 dark:border-white/10">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
          Vehicle Info
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-100">
          <p>
            <strong>Case No:</strong> {vehicle.case_number}
          </p>
          <p>
            <strong>Plate No:</strong> {vehicle.plate_number}
          </p>
          <p>
            <strong>Vehicle Type:</strong> {vehicle.vehicle_type}
          </p>
          <p>
            <strong>Status:</strong> {vehicle.status}
          </p>
          <p className="sm:col-span-2">
            <strong>Organization:</strong> {organizationName}
          </p>
        </div>
      </div>

      {!assignment && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Driver</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white"
              value={formData.driver_id}
              onChange={(e) => handleChange("driver_id", e.target.value)}
            >
              <option value="">Select a driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.display_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Destination</Label>
            <Input
              placeholder="Enter destination"
              value={formData.destination}
              onChange={(e) => handleChange("destination", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Input
              placeholder="Enter purpose"
              value={formData.purpose}
              onChange={(e) => handleChange("purpose", e.target.value)}
            />
          </div>
        </div>
      )}

      {assignment && (
        <div className="p-4 mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg space-y-2 text-sm text-gray-700 dark:text-gray-100">
          <h4 className="text-base font-medium text-blue-700 dark:text-blue-300">
            Assignment Details
          </h4>
          <p>
            <strong>Driver:</strong> {assignment.profiles?.display_name}
          </p>
          <p>
            <strong>Destination:</strong> {assignment.destination}
          </p>
          <p>
            <strong>Purpose:</strong> {assignment.purpose}
          </p>
          <p>
            <strong>Departure:</strong>{" "}
            {new Date(assignment.departure_time).toLocaleString()}
          </p>
          <p>
            <strong>Status:</strong> {assignment.status}
          </p>
          <p>
            <strong>Organization:</strong> {assignment.organizations?.name}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          Close
        </button>
        {!assignment && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {loading ? "Generating..." : "Generate QR"}
          </button>
        )}
      </div>
    </div>
  );
}
function onSuccess(): void {
  throw new Error("Function not implemented.");
}
