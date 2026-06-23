import { NeighborType } from "../interfaces/neighborsInterfaces";

export type NeighborTableProps = {
  tableData: NeighborType[];
  onEdit?: (neighbor: NeighborType) => void;
  onDelete?: (neighbor: NeighborType) => void;
  onCreate?: (data: any) => void;
  onView?: (neighbor: NeighborType) => void;
};
