import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

interface GenerateQRProps {
  onClose: () => void;
  vehicleId: number;
}

interface Vehicle {
  id: number;
  case_number: string;
  plate_number: string;
  vehicle_type: string;
  status: string;
  organization_id: string;
  insurance_document?: string;
}

interface Driver {
  id: string;
  display_name: string;
}

interface Assignment {
  destination: string;
  purpose: string;
  departure_time: string;
  arrival_time: string | null;
  notes: string | null;
  status: string;
  profiles: { display_name: string };
  vehicles: {
    case_number: string;
    plate_number: string;
    vehicle_type: string;
    status: string;
  };
  organizations: {
    name: string;
  };
}

export default function GenerateQR({ onClose, vehicleId }: GenerateQRProps) {
  const [formData, setFormData] = useState({
    destination: "",
    purpose: "",
    driver_id: "",
  });

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [organizationName, setOrganizationName] = useState("Loading...");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/vehicles/${vehicleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await res.json();
      if (res.ok) setVehicle(result);
      else console.error("Failed to fetch vehicle:", result.error);
    };

    fetchVehicle();
  }, [vehicleId]);

  useEffect(() => {
    const fetchOrgAndDrivers = async () => {
      if (!vehicle?.organization_id) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      try {
        const orgRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/organizations/${
            vehicle.organization_id
          }`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const orgData = await orgRes.json();
        setOrganizationName(orgData.name || "Unknown");

        const driversRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/profiles/drivers/${
            vehicle.organization_id
          }`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const driverData = await driversRes.json();
        if (driversRes.ok) {
          driverData.sort((a: Driver, b: Driver) =>
            a.display_name.localeCompare(b.display_name)
          );
          setDrivers(driverData);
        }
      } catch (err) {
        console.error("Error fetching org or drivers", err);
      }
    };

    fetchOrgAndDrivers();
  }, [vehicle]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Unauthorized: No token found.");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/qrcode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          vehicle_id: vehicleId,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "QR generation failed");

      // Fetch the new assignment
      const assignmentRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/qrcode/${vehicleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const assignmentData = await assignmentRes.json();

      if (assignmentRes.ok) {
        setAssignment(assignmentData);
      } else {
        console.error("Failed to fetch assignment:", assignmentData.error);
      }
    } catch (err: any) {
      console.error("QR generation error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-6 space-y-6">
      {vehicle && (
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
      )}

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
