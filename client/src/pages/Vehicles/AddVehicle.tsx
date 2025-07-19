import { useState } from "react";
import { supabase } from "../../supabaseClient";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import VehicleDetails from "../../components/form/form-elements/VehicleDetails";
import InsuranceUpload from "../../components/form/form-elements/InsuranceUpload";

interface AddVehicleProps {
  onClose: () => void;
}

export default function AddVehicle({ onClose }: AddVehicleProps) {
  const [formData, setFormData] = useState<any>({});
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFormChange = (data: any) => {
    setFormData(data);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const form = new FormData();

    for (const key in formData) {
      form.append(key, formData[key]);
    }

    if (insuranceFile) {
      form.append("insuranceFile", insuranceFile);
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      if (!token) throw new Error("Unauthorized: No token found.");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicles`, {
        method: "POST",
        body: form,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Vehicle submit failed");

      onClose(); // Success
    } catch (err: any) {
      console.error("Vehicle submit error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Vehicle" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
        <div className="space-y-6">
          <VehicleDetails onChange={handleFormChange} />
          <InsuranceUpload onFileSelected={setInsuranceFile} />

          <button
            onClick={handleSubmit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition "
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
}
