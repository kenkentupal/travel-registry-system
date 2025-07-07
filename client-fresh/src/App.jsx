import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("uid, org")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching vehicles:", error.message);
      } else {
        setVehicles(data);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🚐 Vehicle Registry</h1>
      <ul className="space-y-2">
        {vehicles.map((v) => (
          <li key={v.id} className="border p-2 rounded">
            <strong>Plate:</strong> {v.org}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
