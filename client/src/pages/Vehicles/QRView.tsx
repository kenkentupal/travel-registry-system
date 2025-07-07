import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react"; // ✅ Make sure you installed: npm i qrcode.react

import { supabase } from "../../supabaseClient";
import GridShape from "../../components/common/GridShape";
import PageMeta from "../../components/common/PageMeta";

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
}

export default function QRView() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicle = async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", parseInt(id!)) // Convert id from string to number
        .single();

      if (error) {
        console.error("Error fetching vehicle:", error.message);
      } else {
        setVehicle(data);
      }

      setLoading(false);
    };

    if (id) fetchVehicle();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-gray-600">Loading vehicle...</div>;
  }

  if (!vehicle) {
    return (
      <div className="p-8 text-center text-red-600">Vehicle not found.</div>
    );
  }

  const qrValue = `${window.location.origin}/vehicle/${vehicle.id}`;

  return (
    <>
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
              <strong>Company:</strong> {vehicle.travel_company}
            </p>
            <p>
              <strong>Driver:</strong> {vehicle.driver_name}
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
                  className="text-blue-500 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Document
                </a>
              </p>
            )}
          </div>

          <div className="mt-8">
            <Link
              to="/vehicles"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Back to Vehicle List
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
