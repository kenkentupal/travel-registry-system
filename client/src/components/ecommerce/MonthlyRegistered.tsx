import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import Select from "../../pages/UiElements/Select";

const VITE_API_URL = import.meta.env.VITE_API_URL;

interface Vehicle {
  created_at: string;
  organization_id: string;
}

interface Props {
  organizationId: string;
}

export default function MonthlyRegistered({ organizationId }: Props) {
  const [monthlyCounts, setMonthlyCounts] = useState<number[]>(
    Array(12).fill(0)
  );
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const res = await fetch(`${VITE_API_URL}/api/vehicles`);
        if (!res.ok) throw new Error("Failed to fetch vehicle data");

        const data: Vehicle[] = await res.json();
        const filtered = organizationId
          ? data.filter((v) => v.organization_id === organizationId)
          : data;

        const years = Array.from(
          new Set(filtered.map((v) => new Date(v.created_at).getFullYear()))
        ).sort((a, b) => b - a);

        setAvailableYears(years);

        const counts = Array(12).fill(0);
        filtered.forEach((v) => {
          const createdAt = new Date(v.created_at);
          if (createdAt.getFullYear() === selectedYear) {
            counts[createdAt.getMonth()]++;
          }
        });

        setMonthlyCounts(counts);
      } catch (err) {
        console.error("Failed to fetch monthly registration data:", err);
        setMonthlyCounts(Array(12).fill(0));
      }
    };

    fetchVehicleData();
  }, [organizationId, selectedYear]);

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: { title: { text: undefined } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val}` },
    },
  };

  const series = [
    {
      name: "Registered Vehicles",
      data: monthlyCounts,
    },
  ];

  const yearOptions = availableYears.map((year) => ({
    label: year.toString(),
    value: year.toString(),
  }));

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Registered Vehicles
        </h3>
        <div className="relative inline-block">
          <Select
            value={selectedYear.toString()}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            options={yearOptions}
            className="w-100"
          />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar mt-4">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}
