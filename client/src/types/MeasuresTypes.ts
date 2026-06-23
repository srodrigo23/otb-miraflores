import { MeasureType } from "../interfaces/measuresIterfaces";

export type MeasureTableProps = {
  tableData: MeasureType[];
  onEdit?: (measure: MeasureType) => void;
  onDelete?: (measure: MeasureType) => void;
  onCreate?: (data: any) => void;
  onView?: (measure: MeasureType) => void;
  onViewReadings?: (measure: MeasureType) => void;
  onGenerateDebts?: (measure: MeasureType) => void;
  onDeleteDebts?: (measure: MeasureType) => void;
};
