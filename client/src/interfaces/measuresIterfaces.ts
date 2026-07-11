
export interface MeasureType {
  id: number;
  measure_date: string;
  period: string;
  reader_name: string;
  status: string;
  notes: string | null;
  is_first_measure:boolean;
  created_at: string;
  updated_at: string;
}
export interface MeasureReadingsType extends MeasureType {
  readings: MeterReadingType[];
}

export interface MeterReadingType {
  id: number;
  meter_id: number;
  measure_id: number;
  current_reading: number;
  status: string;
  has_anomaly: boolean;
  notes: string | null;
  meter_number: string | null;
  created_at: string;
  updated_at: string;
  
  neighbor_first_name: string | null;
  neighbor_second_name: string | null;
  neighbor_last_name: string | null;
  // neighbor_ci: string | null;
  
}
