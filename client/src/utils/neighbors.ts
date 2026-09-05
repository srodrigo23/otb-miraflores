import { NeighborType } from '../interfaces/neighborsInterfaces';

/**
 * Shared by the card list and the table so both views answer the same search
 * the same way. Matches every field a neighbor is realistically looked up by.
 */
export const filterNeighbors = (
  neighbors: NeighborType[],
  searchTerm: string,
) => {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return neighbors;

  return neighbors.filter((neighbor) =>
    [
      neighbor.first_name,
      neighbor.second_name,
      neighbor.last_name,
      neighbor.ci,
      neighbor.phone_number,
      neighbor.email,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query),
  );
};

/** "Apellido Nombres" — the order the OTB register lists people in. */
export const fullName = (neighbor: NeighborType) =>
  [neighbor.last_name, neighbor.first_name, neighbor.second_name]
    .filter(Boolean)
    .join(' ');
