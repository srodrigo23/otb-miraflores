import {
  NeighborType,
  UpdateNeighborPayloadType,
} from '../interfaces/neighborsInterfaces';

/**
 * Fields of the "new neighbor" form. Names match the NeighborCreate schema, so
 * the form data is the request body. Only the names are required; a neighbor
 * can be registered without CI, phone or email, and without any meter.
 */
export type InputsNewNeighborForm = {
  first_name: string;
  second_name: string | null;
  last_name: string;
  ci: number | null;
  phone_number: number | null;
  email: string | null;
};

export type NewNeighborModalFormType = {
  openModalState: boolean;
  handleCloseModal: () => void;
  onSubmit: (data: InputsNewNeighborForm) => Promise<boolean>;
};

/** Fields of the "new meter" form. Names match the NeighborMeter model. */
export type InputsNewMeterForm = {
  meter_code: string;
  section: string;
  /** YYYY-MM-DD, as the date input hands it over */
  created_at: string;
  is_active: boolean;
  initial_reading: number;
};

export type NewMeterModalFormType = {
  openModalState: boolean;
  handleCloseModal: () => void;
  /** Resolves to whether it was created: on failure the form stays open */
  onSubmit: (data: InputsNewMeterForm) => Promise<boolean>;
};

/** Per-field validation messages, keyed by the field they belong to. */
export type NeighborFieldErrors = Partial<
  Record<keyof UpdateNeighborPayloadType, string>
>;

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
