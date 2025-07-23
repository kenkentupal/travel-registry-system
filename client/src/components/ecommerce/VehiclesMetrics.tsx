import { useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, VehicleIcon } from "../../icons";
import Badge from "../ui/badge/Badge";

const VITE_API_URL = import.meta.env.VITE_API_URL;

interface Props {
  organizationId: string;
}

interface Vehicle {
  id: string;
  organization_id: string;
  created_at: string;
}

export default function VehiclesMetrics({ organizationId }: Props) {
  const [vehicleCount, setVehicleCount] = useState(0);
  const [prevVehicleCount, setPrevVehicleCount] = useState(0);
  const [activeVehicleCount, setActiveVehicleCount] = useState(0);
  const [prevActiveVehicleCount, setPrevActiveVehicleCount] = useState(0);

  async function fetchAssignmentStatus(vehicleId: string): Promise<boolean> {
    try {
      const res = await fetch(`${VITE_API_URL}/api/qrcode/${vehicleId}`);
      return res.status === 200;
    } catch (err) {
      console.error(`Error checking QR for vehicle ${vehicleId}:`, err);
      return false;
    }
  }

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${VITE_API_URL}/api/vehicles`);
      if (!res.ok) throw new Error("Failed to fetch vehicles");

      const data: Vehicle[] = await res.json();
      const normalizedOrgId = organizationId.trim();

      const filtered = organizationId
        ? data.filter((v) => v.organization_id.trim() === normalizedOrgId)
        : data;

      const now = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);

      // 📦 Registered vehicles
      setVehicleCount(filtered.length);

      const currentWeek = filtered.filter(
        (v) => new Date(v.created_at) >= oneWeekAgo
      );
      const previousWeek = filtered.filter(
        (v) => new Date(v.created_at) < oneWeekAgo
      );
      setPrevVehicleCount(previousWeek.length);

      // 🚗 Active vehicles (with QR)
      const assignmentChecks = await Promise.all(
        filtered.map((v) => fetchAssignmentStatus(v.id))
      );
      const withQR = filtered.filter((_, i) => assignmentChecks[i]);

      const activeCurrentWeek = withQR.filter(
        (v) => new Date(v.created_at) >= oneWeekAgo
      );
      const activePrevWeek = withQR.filter(
        (v) => new Date(v.created_at) < oneWeekAgo
      );

      setActiveVehicleCount(withQR.length);
      setPrevActiveVehicleCount(activePrevWeek.length);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicleCount(0);
      setPrevVehicleCount(0);
      setActiveVehicleCount(0);
      setPrevActiveVehicleCount(0);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [organizationId]);

  // 📊 Percentage changes
  const vehicleChange =
    prevVehicleCount === 0
      ? 0
      : ((vehicleCount - prevVehicleCount) / prevVehicleCount) * 100;

  const activeChange =
    prevActiveVehicleCount === 0
      ? 0
      : ((activeVehicleCount - prevActiveVehicleCount) /
          prevActiveVehicleCount) *
        100;

  const vehicleChangeDisplay = Math.abs(vehicleChange).toFixed(2) + "%";
  const activeChangeDisplay = Math.abs(activeChange).toFixed(2) + "%";

  const vehicleIsIncrease = vehicleChange >= 0;
  const activeIsIncrease = activeChange >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Registered Vehicles */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <VehicleIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Registered Vehicles
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {vehicleCount.toLocaleString()}
            </h4>
          </div>
          <Badge color={vehicleIsIncrease ? "success" : "error"}>
            {vehicleIsIncrease ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {vehicleChangeDisplay}
          </Badge>
        </div>
      </div>

      {/* Active Vehicles */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <VehicleIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Active Vehicles
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {activeVehicleCount.toLocaleString()}
            </h4>
          </div>
          <Badge color={activeIsIncrease ? "success" : "error"}>
            {activeIsIncrease ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {activeChangeDisplay}
          </Badge>
        </div>
      </div>
    </div>
  );
}
