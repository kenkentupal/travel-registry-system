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

  const oneWeekAgo = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  })();

  const isRecent = (createdAt: string) => new Date(createdAt) >= oneWeekAgo;
  const isOlder = (createdAt: string) => new Date(createdAt) < oneWeekAgo;

  async function fetchAssignmentStatus(vehicleId: string) {
    try {
      const res = await fetch(`${VITE_API_URL}/api/qrcode/${vehicleId}`);
      return res.ok;
    } catch {
      return false;
    }
  }

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${VITE_API_URL}/api/vehicles`);
      if (!res.ok) throw new Error();

      const data: Vehicle[] = await res.json();
      const filtered = organizationId
        ? data.filter((v) => v.organization_id.trim() === organizationId.trim())
        : data;

      setVehicleCount(filtered.length);
      setPrevVehicleCount(filtered.filter((v) => isOlder(v.created_at)).length);

      const checks = await Promise.all(
        filtered.map((v) => fetchAssignmentStatus(v.id))
      );
      const withQR = filtered.filter((_, i) => checks[i]);

      setActiveVehicleCount(withQR.length);
      setPrevActiveVehicleCount(
        withQR.filter((v) => isOlder(v.created_at)).length
      );
    } catch {
      setVehicleCount(0);
      setPrevVehicleCount(0);
      setActiveVehicleCount(0);
      setPrevActiveVehicleCount(0);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [organizationId]);

  const getPercentChange = (current: number, prev: number) =>
    prev === 0 ? 0 : ((current - prev) / prev) * 100;

  const vehicleChange = getPercentChange(vehicleCount, prevVehicleCount);
  const activeChange = getPercentChange(
    activeVehicleCount,
    prevActiveVehicleCount
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Registered Vehicles */}
      <MetricCard
        title="Registered Vehicles"
        count={vehicleCount}
        change={vehicleChange}
        icon={
          <VehicleIcon className="text-gray-800 size-6 dark:text-white/90" />
        }
      />

      {/* Active Vehicles */}
      <MetricCard
        title="Active Vehicles"
        count={activeVehicleCount}
        change={activeChange}
        icon={
          <VehicleIcon className="text-gray-800 size-6 dark:text-white/90" />
        }
      />
    </div>
  );
}

function MetricCard({
  title,
  count,
  change,
  icon,
}: {
  title: string;
  count: number;
  change: number;
  icon: React.ReactNode;
}) {
  const isIncrease = change >= 0;
  const formattedChange = Math.abs(change).toFixed(2) + "%";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {icon}
      </div>
      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {count.toLocaleString()}
          </h4>
        </div>
        <Badge color={isIncrease ? "success" : "error"}>
          {isIncrease ? <ArrowUpIcon /> : <ArrowDownIcon />}
          {formattedChange}
        </Badge>
      </div>
    </div>
  );
}
