export interface NeighborType {
  id: number;
  names: string;
  mat_lname: string|null;

  pat_lname: string;
  ci: number|null;
  phone_number: number|null;
  email: string|null;
}

interface MetersI {
  id:number;
  meter_code: string,
  section: string,
  is_active: boolean
}
export interface NeighborWithDetailsType extends NeighborType{
  meters:MetersI[]
  created_at:string
  updated_at:string
}

export type UpdateNeighborPayloadType = Omit<NeighborWithDetailsType, 'id'>;