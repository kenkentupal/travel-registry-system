import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../../supabaseClient";
import GridShape from "../../components/common/GridShape";

const VITE_API_URL = import.meta.env.VITE_API_URL;

interface Vehicle {
  id: number;
  case_number: string;
  plate_number: string;
  vehicle_type: string;
  travel_company: string;
  driver_name: string;
  contact_number: string;
  notes?: string;
  insurance_document?: string;
  status: string;
  organization_id: string;
}

interface Assignment {
  destination: string;
  purpose: string;
  departure_time: string;
  arrival_time: string | null;
  notes: string | null;
  status: string;
  profiles?: {
    display_name: string;
  };
  organizations?: {
    name: string;
  };
}

export default function QRView() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Unauthorized");

        // Fetch vehicle
        const vehicleRes = await fetch(`${VITE_API_URL}/api/vehicles/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const vehicleData = await vehicleRes.json();
        if (!vehicleRes.ok)
          throw new Error(vehicleData.error || "Vehicle not found");
        setVehicle(vehicleData);

        // Fetch assignment (includes profile + org)
        const assignmentRes = await fetch(`${VITE_API_URL}/api/qrcode/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (assignmentRes.ok) {
          const assignmentData = await assignmentRes.json();
          setAssignment(assignmentData);
        }
      } catch (error) {
        console.error("Error loading QR view:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-gray-600">Loading...</div>;
  if (!vehicle)
    return (
      <div className="p-8 text-red-600 text-center">Vehicle not found.</div>
    );

  const qrValue = `${window.location.origin}/vehicle/${vehicle.id}`;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <GridShape />

      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-xl shadow p-8 text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Vehicle QR View
        </h1>

        <QRCodeCanvas value={qrValue} size={200} className="mx-auto mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mt-6 text-gray-700 dark:text-gray-300">
          <p>
            <strong>Case No:</strong> {vehicle.case_number}
          </p>
          <p>
            <strong>Plate No:</strong> {vehicle.plate_number}
          </p>
          <p>
            <strong>Type:</strong> {vehicle.vehicle_type}
          </p>
          <p>
            <strong>Organization:</strong>{" "}
            {assignment?.organizations?.name || "N/A"}
          </p>
          <p>
            <strong>Driver:</strong>{" "}
            {assignment?.profiles?.display_name || vehicle.driver_name}
          </p>
          <p>
            <strong>Contact:</strong> {vehicle.contact_number}
          </p>
          <p>
            <strong>Status:</strong> {vehicle.status}
          </p>
          {vehicle.notes && (
            <p>
              <strong>Notes:</strong> {vehicle.notes}
            </p>
          )}
          {vehicle.insurance_document && (
            <p>
              <strong>Insurance:</strong>{" "}
              <a
                href={vehicle.insurance_document}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                View Document
              </a>
            </p>
          )}
        </div>

        {assignment ? (
          <div className="mt-6 p-4 border border-blue-200 dark:border-blue-700 rounded bg-blue-50 dark:bg-blue-900/20 text-sm text-left text-blue-900 dark:text-blue-100">
            <h2 className="font-semibold mb-2">Assignment Details</h2>
            <p>
              <strong>Driver:</strong> {assignment.profiles?.display_name}
            </p>
            <p>
              <strong>Destination:</strong> {assignment.destination}
            </p>
            <p>
              <strong>Notes:</strong> {assignment.notes}
            </p>
            <p>
              <strong>Departure:</strong>{" "}
              {new Date(assignment.departure_time).toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong> {assignment.status}
            </p>
          </div>
        ) : (
          <p className="mt-6 text-sm text-red-500">
            No vehicle assignment yet.
          </p>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/vehicles"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            Back to Vehicle List
          </Link>

          <button
            disabled={!assignment}
            className={`inline-flex items-center justify-center rounded-lg px-5 py-3.5 text-sm font-medium ${
              assignment
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            View Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
