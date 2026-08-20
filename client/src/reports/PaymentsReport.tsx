import { Document, Page, Text, View } from '@react-pdf/renderer';

import { PaymentRecord } from '../interfaces/paymentsInterfaces';
import { formatDate, formatTime } from '../utils/dates';
import { currency } from '../utils/format';
import { REPORT_COLORS, reportStyles } from './reportTheme';

/**
 * Collected payments over a date range. Landscape, because eight columns of
 * names and amounts do not fit comfortably on a portrait A4.
 */

/** Column widths in points. A4 landscape minus margins leaves about 786pt */
const COLUMNS = [
  { key: 'receipt', header: 'Recibo', width: 66, align: 'left' as const },
  { key: 'meter', header: 'Medidor', width: 66, align: 'left' as const },
  { key: 'neighbor', header: 'Vecino', width: 190, align: 'left' as const },
  { key: 'collector', header: 'Responsable', width: 120, align: 'left' as const },
  { key: 'amount', header: 'Monto', width: 74, align: 'right' as const },
  { key: 'date', header: 'Fecha', width: 66, align: 'center' as const },
  { key: 'time', header: 'Hora', width: 44, align: 'center' as const },
  { key: 'notes', header: 'Observaciones', width: 160, align: 'left' as const },
];

const rangeLabel = (from: string, to: string) => {
  if (from && to) return `${formatDate(from)} — ${formatDate(to)}`;
  if (from) return `Desde ${formatDate(from)}`;
  if (to) return `Hasta ${formatDate(to)}`;
  return 'Todos los periodos';
};

export const PaymentsReport: React.FC<{
  payments: PaymentRecord[];
  from: string;
  to: string;
  collector: string;
}> = ({ payments, from, to, collector }) => {
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Document title='Reporte de pagos' author='OTB Miraflores'>
      <Page size='A4' orientation='landscape' style={reportStyles.page}>
        <View style={reportStyles.headerRow} fixed>
          <View>
            <Text style={reportStyles.title}>Reporte de pagos</Text>
            <Text style={reportStyles.subtitle}>OTB Miraflores</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={reportStyles.metaLabel}>Rango</Text>
            <Text style={reportStyles.metaValue}>{rangeLabel(from, to)}</Text>
            <Text style={[reportStyles.metaLabel, { marginTop: 4 }]}>
              Responsable
            </Text>
            <Text style={reportStyles.metaValue}>{collector || 'Todos'}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 8 }} fixed>
          <Text style={reportStyles.metaLabel}>Pagos: </Text>
          <Text style={reportStyles.metaValue}>{payments.length}</Text>
          <Text style={[reportStyles.metaLabel, { marginLeft: 16 }]}>
            Total recaudado:{' '}
          </Text>
          <Text style={reportStyles.metaValue}>{currency(total)}</Text>
        </View>

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

        {payments.map((payment) => (
          <View key={payment.id} style={reportStyles.row} wrap={false}>
            <Text style={[reportStyles.cell, { width: COLUMNS[0].width }]}>
              {payment.receipt}
            </Text>
            <Text style={[reportStyles.cell, { width: COLUMNS[1].width }]}>
              {payment.meter_code}
            </Text>
            <Text style={[reportStyles.cell, { width: COLUMNS[2].width }]}>
              {payment.neighbor_name}
            </Text>
            <Text style={[reportStyles.cell, { width: COLUMNS[3].width }]}>
              {payment.collector_name}
            </Text>
            <Text
              style={[
                reportStyles.cell,
                { width: COLUMNS[4].width, textAlign: 'right' },
              ]}
            >
              {currency(payment.amount)}
            </Text>
            <Text
              style={[
                reportStyles.cell,
                { width: COLUMNS[5].width, textAlign: 'center' },
              ]}
            >
              {formatDate(payment.paid_at)}
            </Text>
            <Text
              style={[
                reportStyles.cell,
                { width: COLUMNS[6].width, textAlign: 'center' },
              ]}
            >
              {formatTime(payment.paid_at)}
            </Text>
            <Text style={[reportStyles.cell, { width: COLUMNS[7].width }]}>
              {payment.notes || '-'}
            </Text>
          </View>
        ))}

        {/* Closing total, after the last row rather than pinned to the page */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginTop: 10,
            paddingTop: 6,
            borderTopWidth: 1,
            borderColor: REPORT_COLORS.line,
          }}
          wrap={false}
        >
          <Text style={reportStyles.metaLabel}>TOTAL RECAUDADO: </Text>
          <Text style={[reportStyles.title, { fontSize: 12 }]}>
            {currency(total)}
          </Text>
        </View>

        <View style={reportStyles.footer} fixed>
          <Text>OTB Miraflores · Reporte de pagos</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
