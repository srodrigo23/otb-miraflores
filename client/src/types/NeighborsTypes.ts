import { ReactNode } from 'react';
import { NeighborType } from '../interfaces/neighborsInterfaces';

/**
 * Both neighbor views — the card list and the table — take exactly these props,
 * so the page can swap one for the other without rewiring anything.
 */
export type NeighborsViewProps = {
  neighborsData: NeighborType[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  neighborSelected: NeighborType | null;
  onSelectNeighbor: (neighbor: NeighborType) => void;
  /** Optional — wire this from the parent to enable the "add neighbor" action. */
  onAddNeighbor?: () => void;
  /** Rendered in the header, between the search box and the add button. */
  headerActions?: ReactNode;
};
