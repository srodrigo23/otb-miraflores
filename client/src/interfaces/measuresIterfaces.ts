
export type MeasureStatus = "CREATED" | "IN_PROGRESS" | "CLOSED";

export interface MeasureType {
  id: number;
  measure_date: string;
  period: string;
  reader_name: string;
  status: MeasureStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
export interface MeasureReadingsType extends MeasureType {
  readings: MeterReadingType[];
}

/** Editable fields of a reading, matching MeterReadingUpdate in the backend */
export interface ReadingUpdateType {
  current_reading: number;
  notes: string | null;
}

export interface MeterReadingType {
  id: number;
  meter_id: number;
  measure_id: number;
  current_reading: number;
  // hardcoded to 0 by the backend until the previous measure's reading is looked up
  previous_reading: number;
  meter_number: string | null;
  section: string | null;
  status: string;

  notes: string | null;
  created_at: string;
  updated_at: string;
  
  neighbor_first_name: string | null;
  neighbor_second_name: string | null;
  neighbor_last_name: string | null;
  
}
