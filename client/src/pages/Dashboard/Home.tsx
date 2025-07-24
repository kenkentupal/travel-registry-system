import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useUser } from "../../hooks/useUser";
import Select from "../../components/form/Select";

// Dashboard components
import VehiclesMetrics from "../../components/ecommerce/VehiclesMetrics";
import MonthlyRegistered from "../../components/ecommerce/MonthlyRegistered";
import ScanChart from "../../components/ecommerce/ScanChart";
import TotalActiveVehicles from "../../components/ecommerce/TotalActiveVehicles";
import RecentOrders from "../../components/ecommerce/RecentOrders";

interface Organization {
  id: string;
  name: string;
}

export default function Home() {
  const { user } = useUser();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [loading, setLoading] = useState(true); // 🚀 loading state

  const isPrivileged = ["CEO", "Developer"].includes(user?.position || "");

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const { data } = await supabase.from("organizations").select("id,name");
        setOrganizations(data || []);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        setOrganizations([]);
      }
    };

    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (!user) return;

    if (!isPrivileged) {
      setOrganizationId(user.organization_id || "");
    } else {
      setOrganizationId(""); // Default to "All Organizations"
    }

    setLoading(false); // ✅ Done initializing
  }, [user, isPrivileged]);

  if (loading || (isPrivileged && organizations.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <>
      {/* Organization Filter */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
          Select Organization
        </label>
        <Select
          onChange={(value) => setOrganizationId(value)}
          options={[
            ...(isPrivileged
              ? [{ label: "All Organizations", value: "" }]
              : []),
            ...organizations.map((org) => ({
              label: org.name,
              value: org.id,
            })),
          ]}
          value={organizationId}
          disabled={!isPrivileged}
          placeholder="Select Organization"
        />
      </div>

      {/* Dashboard Layout */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <VehiclesMetrics organizationId={organizationId} />
          <MonthlyRegistered organizationId={organizationId} />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <TotalActiveVehicles organizationId={organizationId} />
        </div>

        <div className="col-span-12">
          <ScanChart organizationId={organizationId} />
        </div>

        {/* <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div> */}
      </div>
    </>
  );
}
