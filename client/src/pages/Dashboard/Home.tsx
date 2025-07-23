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

  // Privileged roles who can view all orgs and select from dropdown
  const isPrivileged = ["CEO", "Developer"].includes(user?.position || "");

  // Fetch organizations list (only once)
  useEffect(() => {
    const fetchOrganizations = async () => {
      const { data } = await supabase.from("organizations").select("id,name");
      setOrganizations(data || []);
    };
    fetchOrganizations();
  }, []);

  // For normal users, set their org automatically (disable select)
  useEffect(() => {
    if (user && !isPrivileged) {
      setOrganizationId(user.organization_id || "");
    }
  }, [user, isPrivileged]);

  // For privileged, default to "All Organizations" (empty string)
  useEffect(() => {
    if (isPrivileged && organizationId === "") {
      setOrganizationId(""); // explicitly "All Organizations"
    }
  }, [organizations, isPrivileged, organizationId]);

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

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
