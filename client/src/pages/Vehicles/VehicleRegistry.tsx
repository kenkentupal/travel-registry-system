import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient"; // adjust path as needed
import AddVehicle from "./AddVehicle"; // adjust path if needed
import { Link } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import Badge from "../../components/ui/badge/Badge";

interface Vehicle {
  id: number;
  case_number: string;
  plate_number: string;
  vehicle_type: string;
  contact_number: string;
  notes?: string;
  insurance_document?: string;
  status: string;
  travel_company: string;
  driver_name: string;
  created_by?: string;
}

export default function VehicleTable() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data, error } = await supabase.from("vehicles").select("*");

      if (error) {
        console.error("Error fetching vehicles:", error.message);
      } else {
        setVehicles(data || []);
      }

      setLoading(false);
    };

    fetchVehicles();
  }, []);

  if (loading)
    return (
      <div className="p-4 text-gray-600 dark:text-gray-300">
        Loading vehicles...
      </div>
    );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
      <div className="flex justify-between items-center px-4 pt-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Vehicles
        </h2>
        <button
          onClick={() => setShowAddVehicle(!showAddVehicle)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          {showAddVehicle ? "Close" : "Add Vehicle"}
        </button>
      </div>

      {showAddVehicle && (
        <div className="px-4 pt-4">
          <AddVehicle onClose={() => setShowAddVehicle(false)} />
        </div>
      )}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/10">
            <TableRow>
              {[
                "Case No",
                "Plate No",
                "Vehicle Type",
                "Company",
                "Driver",
                "Contact No",
                "Notes",
                "Insurance Document",
                "Status",
                "QR Code",
              ].map((header) => (
                <TableCell
                  key={header}
                  isHeader
                  className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/10">
            {vehicles.map((vehicle) => (
              <TableRow
                key={vehicle.id}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
              >
                <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                  {vehicle.case_number}
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                  {vehicle.plate_number}
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                  {vehicle.vehicle_type}
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                  {vehicle.travel_company}
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                  {vehicle.driver_name}
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                  {vehicle.contact_number || "-"}
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                  {vehicle.notes || "-"}
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                  {vehicle.insurance_document ? (
                    <a
                      href={vehicle.insurance_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Badge
                    size="sm"
                    color={
                      vehicle.status === "Approved"
                        ? "success"
                        : vehicle.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {vehicle.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Link
                    to={`/vehicle/${vehicle.id}`}
                    className="text-blue-600 hover:underline text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
