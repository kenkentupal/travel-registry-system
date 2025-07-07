import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard.tsx";
import Label from "../Label.tsx";
import Input from "../input/InputField.tsx";
import Select from "../Select.tsx";
import DatePicker from "../date-picker.tsx";

interface VehicleDetailsProps {
  onChange: (data: any) => void;
}

export default function VehicleDetails({ onChange }: VehicleDetailsProps) {
  const [formData, setFormData] = useState({
    case_number: "",
    plate_number: "",
    vehicle_type: "",
    travel_company: "",
    driver_name: "",
    contact_number: "",
    notes: "",
  });

  useEffect(() => {
    onChange(formData); // Whenever formData changes, pass it up
  }, [formData, onChange]);

  const options = [
    { value: "Van", label: "Van" },
    { value: "SUV", label: "SUV" },
    { value: "Bus", label: "Bus" },
  ];

  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };

  return (
    <ComponentCard title="Vehicle Details">
      <div className="space-y-6">
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
        <div>
          <Label>Vehicle Type</Label>
          <Select
            options={options}
            onChange={(value) =>
              setFormData({ ...formData, vehicle_type: value })
            }
          />
        </div>
        <div>
          <Label htmlFor="companyname">Company Name</Label>
          <Input
            type="text"
            id="companyname"
            placeholder="Company Name"
            value={formData.travel_company}
            onChange={(e) =>
              setFormData({ ...formData, travel_company: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="drivername">Driver Name</Label>
          <Input
            type="text"
            id="drivername"
            placeholder="Driver Name"
            value={formData.driver_name}
            onChange={(e) =>
              setFormData({ ...formData, driver_name: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="contactnumber">Contact Number</Label>
          <Input
            type="text"
            id="contactnumber"
            placeholder="Contact Number"
            value={formData.contact_number}
            onChange={(e) =>
              setFormData({ ...formData, contact_number: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Input
            type="text"
            id="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>
        {/* <div>
          <Label>Password Input</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              )}
            </button>
          </div>
        </div> */}

        <div>
          <DatePicker
            id="date-picker"
            label="Validity Period"
            placeholder="Select a date"
            onChange={(dates, currentDateString) => {
              // Handle your logic
              console.log({ dates, currentDateString });
            }}
          />
        </div>

        {/* <div>
          <Label htmlFor="tm">Time Picker Input</Label>
          <div className="relative">
            <Input
              type="time"
              id="tm"
              name="tm"
              onChange={(e) => console.log(e.target.value)}
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <TimeIcon className="size-6" />
            </span>
          </div>
        </div>
        <div>
          <Label htmlFor="tm">Input with Payment</Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Card number"
              className="pl-[62px]"
            />
            <span className="absolute left-0 top-1/2 flex h-11 w-[46px] -translate-y-1/2 items-center justify-center border-r border-gray-200 dark:border-gray-800">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="6.25" cy="10" r="5.625" fill="#E80B26" />
                <circle cx="13.75" cy="10" r="5.625" fill="#F59D31" />
                <path
                  d="M10 14.1924C11.1508 13.1625 11.875 11.6657 11.875 9.99979C11.875 8.33383 11.1508 6.8371 10 5.80713C8.84918 6.8371 8.125 8.33383 8.125 9.99979C8.125 11.6657 8.84918 13.1625 10 14.1924Z"
                  fill="#FC6020"
                />
              </svg>
            </span>
          </div>
        </div> */}
      </div>
    </ComponentCard>
  );
}
