import { useState } from "react";
import { supabase } from "../../supabaseClient";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import VehicleDetails from "../../components/form/form-elements/VehicleDetails";
import InsuranceUpload from "../../components/form/form-elements/InsuranceUpload";
import PageMeta from "../../components/common/PageMeta";

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

    let insuranceUrl = null;

    if (insuranceFile) {
      const fileExt = insuranceFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("insurance-docs")
        .upload(fileName, insuranceFile);

      if (error) {
        console.error("Upload error:", error.message);
        setLoading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("insurance-docs")
        .getPublicUrl(fileName);

      insuranceUrl = publicUrl.publicUrl;
    }

    const { error } = await supabase.from("vehicles").insert([
      {
        ...formData,
        insurance_document: insuranceUrl,
      },
    ]);

    if (error) {
      console.error("Database error:", error.message);
    } else {
      onClose(); // Close modal
    }

    setLoading(false);
  };

  return (
    <div>
      <PageMeta
        title="React.js Form Elements Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Add Vehicle" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
        <div className="space-y-6">
          <VehicleDetails onChange={handleFormChange} />
          <InsuranceUpload onFileSelected={setInsuranceFile} />

          <button
            onClick={handleSubmit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
}
