import {QRCodeSVG} from 'qrcode.react';

interface QrCodeProps {
    invoiceDataUrl: string;
}

const QrInvoiceCode: React.FC<QrCodeProps> = ({ invoiceDataUrl }) => {
    return (
        <>
            <QRCodeSVG value={invoiceDataUrl} size={128} level="H" />
        </>
    );
}
export default QrInvoiceCode;
