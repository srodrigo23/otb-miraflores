import { NeighborType } from '../interfaces/neighborsInterfaces';

/**
 * Both neighbor views — the card list and the table — take exactly these props,
 * so the page can swap one for the other without rewiring anything. The header
 * (title, search box, actions), the filtering and the navigation on select all
 * live in the Neighbors page, which is why neither appears here.
 */
export type NeighborsViewProps = {
  /** Already filtered by the page's search box. */
  neighbors: NeighborType[];
  /** Size of the unfiltered register, to tell "nothing yet" from "no matches". */
  totalCount: number;
  /** Only for the empty-state message; the filtering already happened. */
  searchTerm: string;
  neighborSelected: NeighborType | null;
  onSelectNeighbor: (neighbor: NeighborType) => void;
};
