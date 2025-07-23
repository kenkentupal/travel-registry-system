import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import GridShape from "../../components/common/GridShape";

// Logos and background
import bg from "../../assets/tvtap_bg.png";
import dotr from "../../assets/dotr.png";
import bp from "../../assets/bagongpilipinas.png";
import tvtap from "../../assets/tvtap_logo.png";
import alpha from "../../assets/alpharso.png";

const VITE_API_URL = import.meta.env.VITE_API_URL;

interface Vehicle {
  id: number;
  case_number: string;
  plate_number: string;
  vehicle_type: string;
  travel_company: string;
  driver_name: string;
  notes?: string;
  insurance_document?: string;
  status: string;
  organization_id: string;
}

interface Assignment {
  destination: string;
  purpose: string;
  notes: string | null;
  profiles?: { display_name: string };
  organizations?: { name: string };
}

export default function QRView() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const vRes = await fetch(`${VITE_API_URL}/api/vehicles/${id}`);
        const vData = await vRes.json();
        if (!vRes.ok) throw new Error(vData.error || "Vehicle not found");
        setVehicle(vData);

        const aRes = await fetch(`${VITE_API_URL}/api/qrcode/${id}`);
        if (aRes.ok) {
          const aData = await aRes.json();
          setAssignment(aData);
        }

        // 👉 Log scan only from public view
        await fetch(`${VITE_API_URL}/api/vehicles/${id}/scan`, {
          method: "POST",
        });
      } catch (err) {
        console.error("Error loading QR view:", err);
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

  const handleDownloadQR = () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `vehicle-${vehicle.plate_number}-QR.png`;
    link.click();
  };

  const renderField = (label: string, value?: string | null) => {
    if (!value) return null;
    return (
      <div className="border border-dashed border-gray-300 rounded p-2">
        <label className="block text-sm text-gray-600 font-small">
          {label}
        </label>
        <p className="font-semibold text-lg tracking-wide ">{value}</p>
      </div>
    );
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen p-6 bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <GridShape />

      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 text-center bg-opacity-90 backdrop-blur-sm">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 tracking-wide">
          Official Vehicle QR Details
        </h1>

        <div className="flex justify-center items-center gap-6 mb-6 mt-4">
          <img src={dotr} alt="DOTR" className="h-16 sm:h-20 object-contain" />
          <img
            src={bp}
            alt="Bagong Pilipinas"
            className="h-16 sm:h-20 object-contain"
          />
          <img
            src={tvtap}
            alt="TVTAP"
            className="h-16 sm:h-20 object-contain"
          />
          <img
            src={alpha}
            alt="Alpha RSO"
            className="h-16 sm:h-20 object-contain"
          />
        </div>

        {/* Hidden QR for download */}
        <div className="hidden">
          <QRCodeCanvas value={qrValue} size={200} ref={qrRef} />
        </div>

        <button
          onClick={handleDownloadQR}
          className="inline-block mt-4 px-4 py-2 text-white text-sm font-medium bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          Download QR
        </button>

        {/* LTO-style Information Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mt-6">
          {renderField("Case Number", vehicle.case_number)}
          {renderField("Plate Number", vehicle.plate_number)}
          {renderField("Vehicle Type", vehicle.vehicle_type)}
          {renderField("Organization", assignment?.organizations?.name)}
          {renderField(
            "Driver",
            assignment?.profiles?.display_name || vehicle.driver_name
          )}
          {renderField("Destination", assignment?.destination)}
          {renderField("Purpose", assignment?.purpose)}
          {renderField("Assignment Notes", assignment?.notes)}
          {renderField("Vehicle Notes", vehicle.notes)}
          {vehicle.insurance_document && (
            <div className="border border-dashed border-gray-300 rounded p-4 sm:col-span-2">
              <label className="block text-sm text-gray-600 mb-1 font-medium">
                Insurance
              </label>
              <a
                href={vehicle.insurance_document}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline font-semibold text-base"
              >
                View Document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
