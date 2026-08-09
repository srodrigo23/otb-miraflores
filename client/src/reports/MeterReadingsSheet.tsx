import { Document, Page, Text, View } from '@react-pdf/renderer';

import {
  MeasureType,
  MeterReadingType,
} from '../interfaces/measuresIterfaces';
import { formatDate } from '../utils/dates';
import { REPORT_COLORS, reportStyles } from './reportTheme';

/**
 * Field sheet for collecting readings on paper.
 *
 * The two rightmost columns are deliberately empty: this is the form the reader
 * fills in while walking the route, not a printout of what is already recorded.
 */

/** Column widths in points. A4 portrait minus margins leaves about 539pt */
const COLUMNS = [
  { key: 'index', header: 'N°', width: 26, align: 'center' as const },
  { key: 'section', header: 'Sección', width: 46, align: 'center' as const },
  { key: 'meter', header: 'Medidor', width: 68, align: 'left' as const },
  { key: 'neighbor', header: 'Apellidos y Nombre', width: 168, align: 'left' as const },
  { key: 'previous', header: 'Lect. Ant.', width: 52, align: 'right' as const },
  { key: 'current', header: 'Lectura Actual', width: 78, align: 'center' as const, blank: true },
  { key: 'notes', header: 'Observaciones', width: 101, align: 'left' as const, blank: true },
];

const getFullName = (reading: MeterReadingType) =>
  `${reading.neighbor_last_name || ''} ${reading.neighbor_first_name || ''} ${reading.neighbor_second_name || ''}`
    .replace(/\s+/g, ' ')
    .trim();

/** Walking order: the reader covers one section at a time */
const byRoute = (a: MeterReadingType, b: MeterReadingType) => {
  const section = (a.section || '').localeCompare(b.section || '');
  if (section !== 0) return section;
  return (a.meter_number || '').localeCompare(b.meter_number || '');
};

export const MeterReadingsSheet: React.FC<{
  measure: MeasureType | undefined;
  readings: MeterReadingType[];
}> = ({ measure, readings }) => {
  const rows = [...readings].sort(byRoute);

  return (
    <Document
      title={`Planilla de lecturación ${measure?.period ?? ''}`}
      author='OTB Miraflores'
    >
      <Page size='A4' style={reportStyles.page}>
        {/* Repeated on every page: the reader may separate the sheets */}
        <View style={reportStyles.headerRow} fixed>
          <View>
            <Text style={reportStyles.title}>Planilla de lecturación</Text>
            <Text style={reportStyles.subtitle}>OTB Miraflores</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={reportStyles.metaLabel}>Periodo</Text>
            <Text style={reportStyles.metaValue}>{measure?.period ?? '-'}</Text>
            <Text style={[reportStyles.metaLabel, { marginTop: 4 }]}>
              Fecha de medición
            </Text>
            <Text style={reportStyles.metaValue}>
              {measure?.measure_date ? formatDate(measure.measure_date) : '-'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 8 }} fixed>
          <Text style={reportStyles.metaLabel}>Responsable: </Text>
          <Text style={reportStyles.metaValue}>
            {measure?.reader_name || '-'}
          </Text>
          <Text style={[reportStyles.metaLabel, { marginLeft: 16 }]}>
            Medidores:{' '}
          </Text>
          <Text style={reportStyles.metaValue}>{rows.length}</Text>
        </View>

        {/* fixed makes it repeat at the top of every page */}
        <View style={reportStyles.tableHeader} fixed>
          {COLUMNS.map((column) => (
            <Text
              key={column.key}
              style={[
                reportStyles.tableHeaderCell,
                { width: column.width, textAlign: column.align },
              ]}
            >
              {column.header}
            </Text>
          ))}
        </View>

        {rows.map((reading, index) => (
          // wrap={false} keeps a row from being split across two pages
          <View key={reading.id} style={reportStyles.row} wrap={false}>
            <Text
              style={[reportStyles.cell, { width: COLUMNS[0].width, textAlign: 'center' }]}
            >
              {index + 1}
            </Text>
            <Text
              style={[reportStyles.cell, { width: COLUMNS[1].width, textAlign: 'center' }]}
            >
              {reading.section || '-'}
            </Text>
            <Text style={[reportStyles.cell, { width: COLUMNS[2].width }]}>
              {reading.meter_number || '-'}
            </Text>
            <Text style={[reportStyles.cell, { width: COLUMNS[3].width }]}>
              {getFullName(reading) || '-'}
            </Text>
            <Text
              style={[reportStyles.cell, { width: COLUMNS[4].width, textAlign: 'right' }]}
            >
              {reading.previous_reading}
            </Text>
            <View
              style={[
                reportStyles.cell,
                reportStyles.blankCell,
                { width: COLUMNS[5].width, height: '100%' },
              ]}
            />
            <View
              style={[
                reportStyles.cell,
                reportStyles.blankCell,
                { width: COLUMNS[6].width, height: '100%' },
              ]}
            />
          </View>
        ))}

        <View style={reportStyles.footer} fixed>
          <Text>OTB Miraflores · {measure?.period ?? ''}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>

        {/* Sits after the last row, not pinned to the page bottom */}
        <View
          style={{
            marginTop: 28,
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}
          wrap={false}
        >
          {['Firma del lector', 'Firma del responsable'].map((label) => (
            <View key={label} style={{ width: 180, alignItems: 'center' }}>
              <View
                style={{
                  borderTopWidth: 1,
                  borderColor: REPORT_COLORS.line,
                  width: '100%',
                  marginBottom: 4,
                }}
              />
              <Text style={reportStyles.metaLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};
