import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { LedgerDebt } from '../interfaces/neighborDebtsInterfaces';
import { formatDate } from '../utils/dates';
import { REPORT_COLORS, REPORT_FONT } from './reportTheme';

/**
 * Payment receipt, printed twice on the same sheet: the neighbor keeps one half
 * and the committee files the other. A dashed rule marks where to cut.
 *
 * A4 is 595.28 x 841.89pt, so half its height is 420.94pt — the receipt block
 * sits at the top and the horizontal cut falls exactly at the middle of the sheet.
 */
const A4_WIDTH = 595.28;
const A4_HALF_HEIGHT = 420.94;
const PAGE_PADDING = 14;
const RECEIPT_WIDTH = (A4_WIDTH - PAGE_PADDING * 2) / 2;

export type ReceiptPayment = {
  /** Number typed by the collector */
  receipt: string;
  date: string;
  method: string;
  notes?: string;
  /** Random stand-in for the UUID the backend will issue */
  reference: string;
  qrDataUrl: string;
};

export type ReceiptNeighbor = {
  fullName: string;
  ci: string;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingHorizontal: PAGE_PADDING,
    fontFamily: REPORT_FONT.base,
    color: REPORT_COLORS.ink,
  },
  sheet: {
    flexDirection: 'row',
    height: A4_HALF_HEIGHT,
  },
  receipt: {
    width: RECEIPT_WIDTH,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: 'flex-start',
  },
  /** The vertical rule between the two halves: where the scissors go */
  cutLine: {
    borderLeftWidth: 1,
    borderLeftStyle: 'dashed',
    borderColor: REPORT_COLORS.line,
  },
  title: {
    fontFamily: REPORT_FONT.bold,
    fontSize: 13.5,
    textAlign: 'center',
  },
  org: {
    fontSize: 9.5,
    textAlign: 'center',
    color: REPORT_COLORS.inkSoft,
    marginTop: 1,
  },
  copyTag: {
    fontSize: 7.5,
    textAlign: 'center',
    letterSpacing: 1,
    color: REPORT_COLORS.inkSoft,
    marginTop: 3,
  },
  rule: {
    borderBottomWidth: 1,
    borderColor: REPORT_COLORS.lineSoft,
    marginVertical: 5,
  },
  sectionTitle: {
    fontFamily: REPORT_FONT.bold,
    fontSize: 8.5,
    letterSpacing: 0.6,
    color: REPORT_COLORS.inkSoft,
    marginBottom: 4,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3.5,
  },
  // Widths matter: without them a long name does not wrap, it overflows the
  // column and runs into the copy beside it
  label: { fontSize: 10, color: REPORT_COLORS.inkSoft, width: '38%' },
  value: {
    fontSize: 10,
    fontFamily: REPORT_FONT.bold,
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: REPORT_COLORS.headerFill,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 5,
  },
  totalLabel: { fontSize: 10, fontFamily: REPORT_FONT.bold },
  totalValue: { fontSize: 18, fontFamily: REPORT_FONT.bold },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  qr: { width: 54, height: 54 },
  qrHint: {
    fontSize: 8,
    color: REPORT_COLORS.inkSoft,
    marginLeft: 8,
    flex: 1,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  signature: { width: '46%' },
  signatureLine: {
    borderTopWidth: 1,
    borderColor: REPORT_COLORS.line,
    marginBottom: 3,
  },
  signatureLabel: { fontSize: 8, textAlign: 'center', color: REPORT_COLORS.inkSoft },
  cutHint: {
    fontSize: 7,
    color: REPORT_COLORS.inkSoft,
    textAlign: 'center',
    marginTop: 3,
  },
  horizontalCut: {
    borderBottomWidth: 1,
    borderBottomStyle: 'dashed',
    borderColor: REPORT_COLORS.line,
  },

  /**
   * Watermarks sit in an absolute layer rendered before the content, so the
   * data paints on top of them. overflow keeps a rotated mark from bleeding
   * into the receipt beside it.
   */
  watermarkLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: RECEIPT_WIDTH,
    height: A4_HALF_HEIGHT,
  },
  tiledGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 6,
  },
  // Each tile rotates on its own: rotating the whole grid would push it past
  // the receipt, and @react-pdf does not clip overflow
  tile: {
    width: '50%',
    fontSize: 9,
    fontFamily: REPORT_FONT.bold,
    color: REPORT_COLORS.watermark,
    textAlign: 'center',
    paddingVertical: 14,
    transform: 'rotate(-20deg)',
  },
  diagonal: {
    position: 'absolute',
    top: A4_HALF_HEIGHT / 2 - 40,
    left: 0,
    width: RECEIPT_WIDTH,
    fontSize: 54,
    fontFamily: REPORT_FONT.bold,
    color: REPORT_COLORS.watermark,
    textAlign: 'center',
    letterSpacing: 4,
    transform: 'rotate(-38deg)',
  },
});

export type ReceiptWatermark =
  | { kind: 'tiled'; text: string }
  | { kind: 'diagonal'; text: string };

const TILE_COUNT = 20;

const Watermark: React.FC<{ watermark: ReceiptWatermark }> = ({ watermark }) => (
  <View style={styles.watermarkLayer}>
    {watermark.kind === 'tiled' ? (
      <View style={styles.tiledGrid}>
        {Array.from({ length: TILE_COUNT }, (_, index) => (
          <Text key={index} style={styles.tile}>
            {watermark.text}
          </Text>
        ))}
      </View>
    ) : (
      <Text style={styles.diagonal}>{watermark.text}</Text>
    )}
  </View>
);

const money = (amountInCents: number) => `Bs ${(amountInCents / 100).toFixed(2)}`;

const InfoLine: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.line}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const ReceiptBody: React.FC<{
  copyTag: string;
  /** The right-hand copy carries the dashed rule that marks the cut */
  withCutLine?: boolean;
  watermark: ReceiptWatermark;
  debt: LedgerDebt;
  meterCode: string;
  neighbor: ReceiptNeighbor;
  payment: ReceiptPayment;
}> = ({
  copyTag,
  withCutLine = false,
  watermark,
  debt,
  meterCode,
  neighbor,
  payment,
}) => (
  <View style={withCutLine ? [styles.receipt, styles.cutLine] : styles.receipt}>
    {/* First child, so every line of data paints over it */}
    <Watermark watermark={watermark} />

    <Text style={styles.title}>RECIBO DE COBRO — AGUA</Text>
    <Text style={styles.org}>OTB Miraflores</Text>
    <Text style={styles.copyTag}>{copyTag}</Text>

    <View style={styles.rule} />

    <InfoLine label='N° de recibo' value={payment.receipt || '-'} />
    <InfoLine label='Fecha de pago' value={formatDate(payment.date)} />
    <InfoLine label='Periodo' value={`${debt.period} ${debt.year}`} />

    <View style={styles.rule} />

    <Text style={styles.sectionTitle}>VECINO</Text>
    <InfoLine label='Nombre' value={neighbor.fullName || '-'} />
    <InfoLine label='CI' value={neighbor.ci || '-'} />
    <InfoLine label='Medidor' value={meterCode} />

    <View style={styles.rule} />

    <Text style={styles.sectionTitle}>CONSUMO</Text>
    <InfoLine label='Lectura anterior' value={`${debt.previous_reading} m³`} />
    <InfoLine label='Lectura actual' value={`${debt.current_reading} m³`} />
    <InfoLine label='Consumo del periodo' value={`${debt.consumption} m³`} />

    <View style={styles.totalRow}>
      <Text style={styles.totalLabel}>TOTAL CANCELADO</Text>
      <Text style={styles.totalValue}>{money(debt.amount)}</Text>
    </View>
    <View style={{ marginTop: 3 }}>
      <InfoLine label='Forma de pago' value={payment.method} />
      {!!payment.notes && <InfoLine label='Observaciones' value={payment.notes} />}
    </View>

    <View style={styles.qrRow}>
      <Image style={styles.qr} src={payment.qrDataUrl} />
      <Text style={styles.qrHint}>
        Escanea para ver este recibo en línea.{'\n'}
        Ref. {payment.reference}
      </Text>
    </View>

    <View style={styles.signatures}>
      {['Cajero', 'Vecino'].map((label) => (
        <View key={label} style={styles.signature}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>{label}</Text>
        </View>
      ))}
    </View>
  </View>
);

export const PaymentReceipt: React.FC<{
  debt: LedgerDebt;
  meterCode: string;
  neighbor: ReceiptNeighbor;
  payment: ReceiptPayment;
}> = ({ debt, meterCode, neighbor, payment }) => (
  <Document
    title={`Recibo ${payment.receipt || payment.reference}`}
    author='OTB Miraflores'
  >
    <Page size='A4' style={styles.page}>
      <View style={styles.sheet}>
        <ReceiptBody
          copyTag='ORIGINAL · VECINO'
          watermark={{ kind: 'tiled', text: 'OTB MIRAFLORES' }}
          debt={debt}
          meterCode={meterCode}
          neighbor={neighbor}
          payment={payment}
        />
        <ReceiptBody
          copyTag='COPIA · ARCHIVO'
          withCutLine
          watermark={{ kind: 'diagonal', text: 'COPIA' }}
          debt={debt}
          meterCode={meterCode}
          neighbor={neighbor}
          payment={payment}
        />
      </View>

      {/* Cut here: this rule sits exactly at half the sheet */}
      <View style={styles.horizontalCut} />
      <Text style={styles.cutHint}>— — —  recortar por las líneas  — — —</Text>
    </Page>
  </Document>
);
