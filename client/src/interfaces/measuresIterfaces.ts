export interface MeasureType {
  id: number;
  measure_date: string;
  period: string;
  reader_name: string | null;
  status: string;

  total_meters: number;
  meters_read: number;
  meters_pending: number;
  notes: string | null;

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
  // reading_date: string;
  // status: string;
  // has_anomaly: boolean;
  notes: string | null;
  meter_number: string | null;
  created_at: string;
  updated_at: string;
  
  neighbor_first_name: string | null;
  neighbor_second_name: string | null;
  neighbor_last_name: string | null;
  // neighbor_ci: string | null;
  
}
