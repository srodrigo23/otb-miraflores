import { Font, StyleSheet } from '@react-pdf/renderer';

/**
 * Words break at spaces only. Left to itself the renderer hyphenates, which on
 * a receipt turns a surname into "QUIS-PECALLATA" — wrong for names, meter
 * codes and amounts alike.
 */
Font.registerHyphenationCallback((word) => [word]);

/**
 * Shared look for every PDF report.
 *
 * Tailwind does not reach here: @react-pdf/renderer draws straight to a PDF
 * canvas instead of the DOM, so there is no CSS and no class names. It supports
 * its own StyleSheet with a subset of flexbox, and sizes are in points (72pt = 1in).
 * Keeping the tokens in this file is what makes the reports look like one system.
 */

export const REPORT_COLORS = {
  ink: '#1a2027',
  inkSoft: '#5a6873',
  line: '#b0bec5',
  lineSoft: '#dde3e7',
  headerFill: '#eceff1',
  /** Cells the reader fills in by hand */
  blankFill: '#ffffff',
};

export const REPORT_FONT = {
  base: 'Helvetica',
  bold: 'Helvetica-Bold',
};

export const reportStyles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 34,
    paddingHorizontal: 28,
    fontFamily: REPORT_FONT.base,
    fontSize: 9,
    color: REPORT_COLORS.ink,
  },
  title: {
    fontFamily: REPORT_FONT.bold,
    fontSize: 14,
  },
  subtitle: {
    fontSize: 9,
    color: REPORT_COLORS.inkSoft,
  },
  metaLabel: {
    fontSize: 8,
    color: REPORT_COLORS.inkSoft,
  },
  metaValue: {
    fontFamily: REPORT_FONT.bold,
    fontSize: 9,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: REPORT_COLORS.headerFill,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: REPORT_COLORS.line,
  },
  tableHeaderCell: {
    fontFamily: REPORT_FONT.bold,
    fontSize: 8,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: REPORT_COLORS.lineSoft,
    minHeight: 22,
    alignItems: 'center',
  },
  cell: {
    fontSize: 9,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  /** Column the reader writes into: left as empty ruled space on purpose */
  blankCell: {
    backgroundColor: REPORT_COLORS.blankFill,
    borderLeftWidth: 1,
    borderColor: REPORT_COLORS.lineSoft,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 28,
    right: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: REPORT_COLORS.inkSoft,
  },
});
