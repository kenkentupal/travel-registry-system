export interface Vehicle {
  id: number;
  case_number: string;
  plate_number: string;
  vehicle_type: string;
  status: string;
  insurance_document?: string;
  organization_id: string;
}
