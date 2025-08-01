export interface Assignment {
  destination: string;
  purpose: string;
  departure_time: string;
  arrival_time: string | null;
  notes: string | null;
  status: string;
  profiles: { display_name: string };
  vehicles: {
    case_number: string;
    plate_number: string;
    vehicle_type: string;
    status: string;
  };
  organizations: {
    name: string;
  };
}
