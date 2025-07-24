import { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import Select from "../../pages/UiElements/Select";

const VITE_API_URL = import.meta.env.VITE_API_URL;

interface Props {
  organizationId: string;
}

export default function StatisticsChart({ organizationId }: Props) {
  const [scanCounts, setScanCounts] = useState<number[]>(Array(12).fill(0));
  const [loading, setLoading] = useState(false);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  useEffect(() => {
    const fetchScanData = async () => {
      setLoading(true);
      try {
        const url = organizationId
          ? `${VITE_API_URL}/api/vehicles/vehicle-scans?organizationId=${organizationId}&year=${selectedYear}`
          : `${VITE_API_URL}/api/vehicles/vehicle-scans?year=${selectedYear}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !Array.isArray(data.counts)) {
          throw new Error(data.error || "Invalid response");
        }

        const stableCounts = [...data.counts]; // ensure new reference
        setScanCounts((prev) =>
          JSON.stringify(prev) !== JSON.stringify(stableCounts)
            ? stableCounts
            : prev
        );

        const years = Array.isArray(data.years) ? data.years : [selectedYear];
        const sortedYears = [...new Set(years)] as number[];
        sortedYears.sort((a, b) => b - a);

        setAvailableYears((prev) =>
          JSON.stringify(prev) !== JSON.stringify(sortedYears)
            ? sortedYears
            : prev
        );
      } catch (err) {
        console.error("Failed to fetch scan stats:", err);
        setScanCounts(Array(12).fill(0));
      } finally {
        setLoading(false);
      }
    };

    fetchScanData();
  }, [organizationId, selectedYear]);

  // ✅ Stable options using useMemo
  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        id: "scan-stats",
        toolbar: { show: false },
        zoom: { enabled: false },
        foreColor: "#555",
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.6,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
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
      },
      tooltip: {
        enabled: true,
      },
      dataLabels: { enabled: false },
      grid: { borderColor: "#eee" },
    }),
    []
  );

  // ✅ Memoized series
  const series = useMemo(
    () => [{ name: "Scans", data: [...scanCounts] }],
    [JSON.stringify(scanCounts)]
  );

  const yearOptions = useMemo(
    () =>
      availableYears.map((year) => ({
        label: year.toString(),
        value: year.toString(),
      })),
    [availableYears]
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            QR Scan Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Public QR scans per month
          </p>
        </div>
        <div className="flex items-start w-32 gap-3 sm:justify-end">
          <Select
            value={selectedYear.toString()}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            options={yearOptions}
            className="w-28"
          />
        </div>
      </div>

      {/* Chart or Loading */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px] xl:min-w-full">
            <Chart options={options} series={series} type="area" height={310} />
          </div>
        </div>
      )}
    </div>
  );
}
