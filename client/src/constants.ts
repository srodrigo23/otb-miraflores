/** The sections the OTB is divided into. Every meter belongs to one of them. */
export const METER_SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export const STATUS_COLORS: Record<string, string> = {
  CREATED: 'green',
  IN_PROGRESS: 'blue',
  CLOSED: 'red',
};

export const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Creada',
  IN_PROGRESS: 'En Progreso',
  CLOSED: 'Cerrada',
};
