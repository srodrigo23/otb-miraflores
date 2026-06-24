export interface NeighborType {
  id: number;
  first_name: string;
  second_name: string;
  last_name: string;
  ci: string;
  phone_number: string;
  email: string;
}

export interface NeighborWithDetailsType extends NeighborType{
  birth_day:string|null;
  created_at:string
  updated_at:string
  section:string
}