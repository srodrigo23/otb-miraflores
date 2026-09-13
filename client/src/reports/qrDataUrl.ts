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
 * Where the QR sends whoever scans it: the public view of this receipt.
 *
 * The reference is the UUID the API minted with the payment, not something the
 * browser invents: the QR has to survive being scanned months later.
 */
export const receiptPublicUrl = (reference: string) =>
  `${window.location.origin}/recibos/${reference}`;
