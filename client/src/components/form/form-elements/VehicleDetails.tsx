import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard.tsx";
import Label from "../Label.tsx";
import Input from "../input/InputField.tsx";
import DatePicker from "../date-picker.tsx";
import Select from "../Select.tsx";
import { useUser } from "../../../hooks/useUser.ts";

const VITE_API_URL = import.meta.env.VITE_API_URL;

interface Organization {
  id: string;
  name: string;
}

interface VehicleDetailsProps {
  onChange: (data: any) => void;
}

export default function VehicleDetails({ onChange }: VehicleDetailsProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (user && !["CEO", "Developer"].includes(user.position)) {
      setFormData((prev) => ({
        ...prev,
        organization_id: user.organization_id,
      }));
    }
  }, [user]);

  const [formData, setFormData] = useState({
    case_number: "",
    plate_number: "",
    vehicle_type: "",
    organization_id: "",
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await fetch(`${VITE_API_URL}/api/organizations`);
        if (!res.ok) throw new Error("Failed to fetch organizations");
        const data = await res.json();
        setOrganizations(data);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchOrganizations();
  }, []);

  const vehicleTypeOptions = [
    { value: "Van", label: "Van" },
    { value: "SUV", label: "SUV" },
    { value: "Bus", label: "Bus" },
  ];

  return (
    <ComponentCard title="Vehicle Details">
      <div className="space-y-6">
        {/* Case Number */}
        <div>
          <Label htmlFor="casenumber">Case Number</Label>
          <Input
            type="text"
            id="casenumber"
            placeholder="Case Number"
            value={formData.case_number}
            onChange={(e) =>
              setFormData({ ...formData, case_number: e.target.value })
            }
          />
        </div>

        {/* Plate Number */}
        <div>
          <Label htmlFor="platenumber">Plate Number</Label>
          <Input
            type="text"
            id="platenumber"
            placeholder="Plate Number"
            value={formData.plate_number}
            onChange={(e) =>
              setFormData({ ...formData, plate_number: e.target.value })
            }
          />
        </div>

        {/* Vehicle Type */}
        <div>
          <Label>Vehicle Type</Label>
          <Select
            options={vehicleTypeOptions}
            onChange={(value) =>
              setFormData({ ...formData, vehicle_type: value })
            }
          />
        </div>

        {/* Organization Dropdown */}
        <div>
          <Label>Organization</Label>
          <Select
            options={organizations.map((org) => ({
              value: org.id,
              label: org.name,
            }))}
            onChange={(value) =>
              setFormData({ ...formData, organization_id: value })
            }
            value={formData.organization_id}
            disabled={!["CEO", "Developer"].includes(user?.position || "")}
          />
        </div>

        {/* Date Picker (optional, maybe for vehicle validity?) */}
        <div>
          <DatePicker
            id="date-picker"
            label="Validity Period"
            placeholder="Select a date"
            onChange={(dates, currentDateString) => {
              console.log({ dates, currentDateString });
              // optionally update formData here if needed
            }}
          />
        </div>
      </div>
    </ComponentCard>
  );
}
