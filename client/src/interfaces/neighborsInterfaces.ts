export interface NeighborType {
  id: number;
  first_name: string;
  second_name: string|null;

  last_name: string;
  ci: number|null;
  phone_number: number|null;
  email: string|null;
}

export interface NeighborWithDetailsType extends NeighborType{
  birth_day:string|null;
  created_at:string
  updated_at:string
}

export type UpdateNeighborPayloadType = Omit<NeighborWithDetailsType, 'id'>;