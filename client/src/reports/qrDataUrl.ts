import QRCode from 'qrcode';

/**
 * PNG data URL for a QR code. @react-pdf/renderer draws images from data URLs,
 * so the code has to be rasterized before the document is built.
 */
export const toQrDataUrl = (text: string) =>
  QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 0,
    scale: 8,
    color: { dark: '#1a2027ff', light: '#ffffffff' },
  });

/**
 * Reference the QR points at.
 *
 * Placeholder: a random number stands in for the UUID the backend will mint
 * when the payment is actually registered.
 */
export const createReceiptReference = () =>
  String(Math.floor(Math.random() * 1_000_000_000)).padStart(9, '0');

/** Where the QR sends whoever scans it: the public view of this receipt */
export const receiptPublicUrl = (reference: string) =>
  `${window.location.origin}/recibos/${reference}`;
