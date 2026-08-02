import { useState } from 'react';
import { Typography, Chip, IconButton, Input } from '@material-tailwind/react';
import {
  CheckIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import {
  MeterReadingType,
  ReadingUpdateType,
} from '../../interfaces/measuresIterfaces';

import { color } from '../../types/commonTypes';

// Keys match MeterReadingStatus in the backend (app/enums.py)
const STATUS_COLORS: { [key: string]: color } = {
  UNREAD: 'blue-gray',
  READED: 'green',
  METER_ERROR: 'red',
};

const STATUS_LABELS: { [key: string]: string } = {
  UNREAD: 'Sin Leer',
  READED: 'Leído',
  METER_ERROR: 'Error Medidor',
};

const EMPTY_VALUE = '-';

const getFullName = (reading: MeterReadingType) =>
  `${reading.neighbor_last_name || ''} ${reading.neighbor_first_name || ''} ${reading.neighbor_second_name || ''}`.trim();

/** Regular cell content: every column that is plain text renders through this */
const CellText: React.FC<{ children: React.ReactNode; bold?: boolean }> = ({
  children,
  bold = false,
}) => (
  <Typography
    variant='small'
    color='blue-gray'
    className={bold ? 'font-semibold' : 'font-normal'}
  >
    {children}
  </Typography>
);

/** The two editable fields of a reading, held as text while the row is open */
type ReadingDraft = {
  current_reading: string;
  notes: string;
};

/** What a cell needs to know about the edit state of its own row */
type RowEditing = {
  isEditing: boolean;
  /** While true no row can be edited, and the pencil is hidden */
  isReadOnly: boolean;
  isSaving: boolean;
  draft: ReadingDraft;
  updateDraft: (patch: Partial<ReadingDraft>) => void;
  start: () => void;
  confirm: () => void;
  cancel: () => void;
};

type ReadingColumn = {
  /** Stable identity for React keys */
  key: string;
  /** Header label */
  header: string;
  /** Row renderer. `index` is the position in the list, used by the numbering column */
  cell: (
    reading: MeterReadingType,
    index: number,
    editing: RowEditing,
  ) => React.ReactNode;
};

/** Shared props so the inline inputs stay compact inside a table cell */
const inputProps = {
  crossOrigin: undefined,
  variant: 'outlined' as const,
  labelProps: { className: 'hidden' },
  className: '!border-blue-gray-200 focus:!border-blue-500',
};

/**
 * Single source of truth for the table: the same array renders the header and
 * the body, so a column cannot exist in one and be missing from the other.
 * Adding a column here is the only change needed to show it.
 */
const COLUMNS: ReadingColumn[] = [
  {
    key: 'index',
    header: 'Núm.',
    cell: (_reading, index) => <CellText>{index + 1}</CellText>,
  },
  {
    key: 'section',
    header: 'Sección',
    cell: (reading) => <CellText>{reading.section || EMPTY_VALUE}</CellText>,
  },
  {
    key: 'meter',
    header: 'Medidor',
    cell: (reading) => (
      <CellText>{reading.meter_number || EMPTY_VALUE}</CellText>
    ),
  },
  {
    key: 'neighbor',
    header: 'Apellidos y Nombre',
    cell: (reading) => (
      <CellText>{getFullName(reading) || EMPTY_VALUE}</CellText>
    ),
  },
  {
    key: 'previous_reading',
    header: 'Ant. Lectura',
    cell: (reading) => <CellText>{reading.previous_reading}</CellText>,
  },
  {
    key: 'current_reading',
    header: 'Lectura Actual',
    cell: (reading, _index, editing) =>
      editing.isEditing ? (
        <Input
          {...inputProps}
          type='number'
          min={0}
          value={editing.draft.current_reading}
          onChange={(e) => editing.updateDraft({ current_reading: e.target.value })}
          containerProps={{ className: '!min-w-0 !w-28' }}
          autoFocus
        />
      ) : (
        <CellText bold>{reading.current_reading}</CellText>
      ),
  },
  {
    key: 'status',
    header: 'Estado',
    cell: (reading) => (
      <Chip
        className='w-fit'
        size='sm'
        value={STATUS_LABELS[reading.status] || reading.status}
        color={STATUS_COLORS[reading.status] || 'gray'}
      />
    ),
  },
  {
    key: 'notes',
    header: 'Observaciones',
    cell: (reading, _index, editing) =>
      editing.isEditing ? (
        <Input
          {...inputProps}
          type='text'
          maxLength={200}
          value={editing.draft.notes}
          onChange={(e) => editing.updateDraft({ notes: e.target.value })}
          containerProps={{ className: '!min-w-0 !w-56' }}
        />
      ) : (
        <CellText>{reading.notes || EMPTY_VALUE}</CellText>
      ),
  },
  {
    key: 'actions',
    header: 'Acciones',
    cell: (_reading, _index, editing) => (
      <div className='flex justify-center gap-1'>
        {editing.isEditing ? (
          <>
            <IconButton
              size='sm'
              variant='text'
              color='green'
              onClick={editing.confirm}
              disabled={editing.isSaving}
              title='Guardar'
            >
              <CheckIcon className='h-4 w-4' />
            </IconButton>
            <IconButton
              size='sm'
              variant='text'
              color='red'
              onClick={editing.cancel}
              disabled={editing.isSaving}
              title='Cancelar'
            >
              <XMarkIcon className='h-4 w-4' />
            </IconButton>
          </>
        ) : (
          !editing.isReadOnly && (
            <IconButton
              size='sm'
              variant='text'
              color='blue'
              onClick={editing.start}
              title='Editar lectura'
            >
              <PencilSquareIcon className='h-4 w-4' />
            </IconButton>
          )
        )}
      </div>
    ),
  },
];

const EMPTY_DRAFT: ReadingDraft = { current_reading: '', notes: '' };

const MeasureReadingsTable: React.FC<{
  readings: MeterReadingType[];
  /** Persists the row. Without it the edit only lives in this component */
  onSaveReading?: (
    readingId: number,
    values: ReadingUpdateType,
  ) => void | Promise<unknown>;
  /** Hides the edit action, e.g. once the measure is closed */
  isReadOnly?: boolean;
}> = ({ readings, onSaveReading, isReadOnly = false }) => {
  // Only one row is editable at a time: opening another one closes the current
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ReadingDraft>(EMPTY_DRAFT);
  // Keeps the row open while the request is in flight, so a failed save does
  // not silently drop what was typed
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = (reading: MeterReadingType) => {
    setEditingId(reading.id);
    setDraft({
      current_reading: String(reading.current_reading ?? 0),
      notes: reading.notes ?? '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  };

  const confirmEditing = async (reading: MeterReadingType) => {
    if (isSaving) return;
    const trimmedNotes = draft.notes.trim();
    setIsSaving(true);
    try {
      await onSaveReading?.(reading.id, {
        // an empty or non-numeric input falls back to the stored value
        current_reading:
          Number(draft.current_reading) || reading.current_reading,
        notes: trimmedNotes === '' ? null : trimmedNotes,
      });
      cancelEditing();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className='h-[600px] overflow-y-auto'>
        <div className='flex flex-col h-full'>
          <div className='flex-1 overflow-auto border border-blue-gray-100 rounded-lg'>
            {readings?.length === 0 ? (
              <div className='flex items-center justify-center h-full'>
                <Typography variant='small' color='gray'>
                  No hay lecturas registradas para esta medición
                </Typography>
              </div>
            ) : (
              <table className='w-full min-w-max table-auto text-left'>
                <thead className='sticky top-0 bg-blue-gray-50 z-10'>
                  <tr>
                    {COLUMNS.map(({ key, header }) => (
                      <th
                        key={key}
                        className='border-b border-blue-gray-100 bg-blue-gray-50 p-3'
                      >
                        <Typography
                          variant='small'
                          color='blue-gray'
                          className='font-bold'
                        >
                          {header}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {readings.map((reading, index) => {
                    const isLast = index === readings.length - 1;
                    const classes = isLast
                      ? 'p-3'
                      : 'p-3 border-b border-blue-gray-50';

                    const isEditing = editingId === reading.id;
                    const editing: RowEditing = {
                      isEditing,
                      isReadOnly,
                      isSaving: isEditing && isSaving,
                      draft,
                      updateDraft: (patch) =>
                        setDraft((current) => ({ ...current, ...patch })),
                      start: () => startEditing(reading),
                      confirm: () => confirmEditing(reading),
                      cancel: cancelEditing,
                    };

                    return (
                      <tr
                        key={reading.id}
                        className={
                          isEditing
                            ? 'bg-blue-50/50'
                            : 'hover:bg-blue-gray-50/50'
                        }
                        // Enter confirms and Escape cancels: this table is filled
                        // in by keyboard, one meter after another
                        onKeyDown={(e) => {
                          if (!isEditing) return;
                          if (e.key === 'Enter') confirmEditing(reading);
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      >
                        {COLUMNS.map(({ key, cell }) => (
                          <td key={key} className={classes}>
                            {cell(reading, index, editing)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MeasureReadingsTable;
