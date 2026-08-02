import { MeterLedger } from '../interfaces/neighborDebtsInterfaces';

/**
 * Placeholder data for the neighbor debts and payments view, until the
 * endpoints are wired up. Two meters so the selector has something to switch
 * between, and six periods of history so the consumption line shows a trend.
 */
export const MOCK_METER_LEDGERS: MeterLedger[] = [
  {
    id: 1,
    code: 'MED-014',
    section: 'A',
    history: [
      { period: 'JUL-AGO', year: 2025, consumption: 22 },
      { period: 'SEP-OCT', year: 2025, consumption: 19 },
      { period: 'NOV-DIC', year: 2025, consumption: 31 },
      { period: 'ENE-FEB', year: 2026, consumption: 25 },
      { period: 'MAR-ABR', year: 2026, consumption: 15 },
      { period: 'MAY-JUN', year: 2026, consumption: 48 },
    ],
    debts: [
      {
        id: 3,
        period: 'MAYO-JUNIO',
        year: 2026,
        previousReading: 220,
        currentReading: 268,
        consumption: 48,
        amount: 48,
        status: 'PENDING',
      },
      {
        id: 2,
        period: 'MARZO-ABRIL',
        year: 2026,
        previousReading: 205,
        currentReading: 220,
        consumption: 15,
        amount: 20,
        status: 'PENDING',
      },
      {
        id: 1,
        period: 'ENERO-FEBRERO',
        year: 2026,
        previousReading: 180,
        currentReading: 205,
        consumption: 25,
        amount: 25,
        status: 'PAID',
      },
    ],
    // Every payment settles one debt in full, so each one matches a PAID period
    payments: [
      {
        id: 1,
        receipt: 'REC-0098',
        date: '2026-03-08',
        period: 'ENERO-FEBRERO',
        amount: 25,
        method: 'Efectivo',
      },
    ],
  },
  {
    id: 2,
    code: 'MED-051',
    section: 'C',
    history: [
      { period: 'JUL-AGO', year: 2025, consumption: 9 },
      { period: 'SEP-OCT', year: 2025, consumption: 11 },
      { period: 'NOV-DIC', year: 2025, consumption: 8 },
      { period: 'ENE-FEB', year: 2026, consumption: 10 },
      { period: 'MAR-ABR', year: 2026, consumption: 12 },
      { period: 'MAY-JUN', year: 2026, consumption: 12 },
    ],
    debts: [
      {
        id: 5,
        period: 'MAYO-JUNIO',
        year: 2026,
        previousReading: 92,
        currentReading: 104,
        consumption: 12,
        amount: 20,
        status: 'PENDING',
      },
      {
        id: 4,
        period: 'MARZO-ABRIL',
        year: 2026,
        previousReading: 80,
        currentReading: 92,
        consumption: 12,
        amount: 20,
        status: 'PAID',
      },
    ],
    payments: [
      {
        id: 3,
        receipt: 'REC-0121',
        date: '2026-05-03',
        period: 'MARZO-ABRIL',
        amount: 20,
        method: 'Transferencia',
      },
    ],
  },
];
