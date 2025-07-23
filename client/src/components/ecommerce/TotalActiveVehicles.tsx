import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon, ArrowUpIcon, ArrowDownIcon } from "../../icons";

const VITE_API_URL = import.meta.env.VITE_API_URL;

interface Props {
  organizationId: string;
}
interface Vehicle {
  id: string;
  created_at: string;
  organization_id: string;
}

export default function TotalActive({ organizationId }: Props) {
  const [activePercent, setActivePercent] = useState<number>(0);
  const [prevVehicleCount, setPrevVehicleCount] = useState<number>(0);
  const [prevActiveVehicleCount, setPrevActiveVehicleCount] =
    useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`${VITE_API_URL}/api/vehicles`);
      const vehicles = await res.json();

      // 👉 Do not filter by organization, always get total
      const now = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);

      const previousWeek = vehicles.filter(
        (v: any) => new Date(v.created_at) < oneWeekAgo
      );
      setPrevVehicleCount(previousWeek.length);

      const assignmentChecks = await Promise.all(
        vehicles.map((v: any) =>
          fetch(`${VITE_API_URL}/api/qrcode/${v.id}`).then(
            (res) => res.status === 200
          )
        )
      );

      const activeVehicles = vehicles.filter(
        (vehicle: Vehicle, i: number) => assignmentChecks[i]
      );

      const activeCount = activeVehicles.length;
      const totalCount = vehicles.length;
      const activePreviousWeek = activeVehicles.filter(
        (v: any) => new Date(v.created_at) < oneWeekAgo
      );

      setPrevActiveVehicleCount(activePreviousWeek.length);

      const percent = totalCount === 0 ? 0 : (activeCount / totalCount) * 100;
      setActivePercent(parseFloat(percent.toFixed(2)));
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
      setActivePercent(0);
      setPrevVehicleCount(0);
      setPrevActiveVehicleCount(0);
    }
  };

  useEffect(() => {
    fetchData();
  }, [organizationId]); // still re-fetch when org changes (optional)

  const prevActivePercent =
    prevVehicleCount === 0
      ? 0
      : parseFloat(
          ((prevActiveVehicleCount / prevVehicleCount) * 100).toFixed(2)
        );

  const isGrowth = activePercent >= prevActivePercent;

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Active Vehicles %"],
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        {/* Header */}
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Total Active Vehicles %
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Across all organizations this week
            </p>
          </div>
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem onItemClick={closeDropdown}>View More</DropdownItem>
              <DropdownItem onItemClick={closeDropdown}>Delete</DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* Radial Chart */}
        <div className="relative">
          <div className="max-h-[330px]" id="chartDarkStyle">
            <Chart
              options={options}
              series={[activePercent]}
              type="radialBar"
              height={330}
            />
          </div>
          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            {isGrowth ? (
              <>
                <ArrowUpIcon className="inline-block size-4 mr-1" />+
                {(activePercent - prevActivePercent).toFixed(2)}%
              </>
            ) : (
              <>
                <ArrowDownIcon className="inline-block size-4 mr-1" />-
                {(prevActivePercent - activePercent).toFixed(2)}%
              </>
            )}
          </span>
        </div>

        {/* Description */}
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {activePercent}% of all registered vehicles are currently active.
        </p>
      </div>

      {/* Previous stats */}
      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div className="text-center">
          <p className="mb-1 text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Registered (Prev)
          </p>
          <p className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {prevVehicleCount.toLocaleString()}
          </p>
        </div>
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
        <div className="text-center">
          <p className="mb-1 text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Active (Prev)
          </p>
          <p className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {prevActiveVehicleCount.toLocaleString()}
          </p>
        </div>
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
        <div className="text-center">
          <p className="mb-1 text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Active % (Prev)
          </p>
          <p className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {prevActivePercent}%
          </p>
        </div>
      </div>
    </div>
  );
}
