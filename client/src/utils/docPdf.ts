// import { jsPDF } from 'jspdf';

// type DataForPDFReceiptType = 
// {
//   form : {
//     lecturaActual: number
//     lecturaAnterior : number
//     montoCobrar: number
//     montoPagado : number
//     gestion:string
//     nombre:string
//     ci:string
//     fechaPago:string
//     horaPago:string
//   }
// }


// const generatePDF =({ form }: DataForPDFReceiptType) => {
//     // const v = validate();
//     // if (v) {
//     //   setError(v);
//     //   return;
//     // }
//     // setError(null);

//     const lecturaActual = form.lecturaActual;
//     const lecturaAnterior = Number(form.lecturaAnterior);
//     const consumo = lecturaActual - lecturaAnterior;
//     const montoCobrar = Number(form.montoCobrar);
//     const montoPagado = Number(form.montoPagado);
//     const cambio = montoPagado - montoCobrar;
//     const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  
//     // helper para dibujar un recibo en una columna (leftX) a partir de topY
//     const drawReceipt = (leftX: number, topY: number) => {
//       let yy = topY;
//       const padding = 3; // Margen interno para centrar el contenido
//       const contentLeft = leftX + padding;

//       // Título centrado y destacado (más compacto)
//       doc.setFontSize(13);
//       doc.setFont('helvetica', 'bold');

//       // Primera línea del título centrada
//       const title1 = 'RECIBO DE COBRO - AGUA';
//       const title1Width = doc.getTextWidth(title1);
//       doc.text(title1, leftX + (85 - title1Width) / 2, yy);
//       yy += 5;

//       // Segunda línea del título centrada
//       doc.setFontSize(11);
//       const title2 = `OTB - Miraflores ${form.gestion}`;
//       const title2Width = doc.getTextWidth(title2);
//       doc.text(title2, leftX + (85 - title2Width) / 2, yy);
//       yy += 5;

//       // Línea separadora
//       doc.setLineWidth(0.3);
//       doc.line(contentLeft, yy, leftX + 85 - padding, yy);
//       yy += 5;

//       // Información del cliente (más compacta)
//       doc.setFontSize(8);
//       doc.setFont('helvetica', 'bold');
//       doc.text('DATOS DEL CLIENTE', contentLeft, yy);
//       yy += 4;

//       doc.setFont('helvetica', 'normal');
//       doc.setFontSize(8);
//       doc.text('Nombre:', contentLeft, yy);
//       doc.text(String(form.nombre || '-'), contentLeft + 17, yy);
//       yy += 4;

//       doc.text('CI:', contentLeft, yy);
//       doc.text(String(form.ci || '-'), contentLeft + 17, yy);
//       doc.text('Fecha:', contentLeft + 42, yy);
//       doc.text(form.fechaPago, contentLeft + 55, yy);
//       yy += 4;

//       doc.text('Hora:', contentLeft, yy);
//       doc.text(form.horaPago, contentLeft + 17, yy);
//       yy += 5;

//       // Línea separadora
//       doc.setLineWidth(0.2);
//       doc.line(contentLeft, yy, leftX + 85 - padding, yy);
//       yy += 4;

//       // Información de consumo (más compacta)
//       doc.setFont('helvetica', 'bold');
//       doc.setFontSize(8);
//       doc.text('CONSUMO', contentLeft, yy);
//       yy += 4;

//       doc.setFont('helvetica', 'normal');
//       doc.text('Lect. anterior:', contentLeft, yy);
//       doc.text(String(form.lecturaAnterior || '-'), contentLeft + 24, yy);
//       doc.text('m³', contentLeft + 34, yy);
//       doc.text('Lect. actual:', contentLeft + 42, yy);
//       doc.text(String(form.lecturaActual || '-'), contentLeft + 62, yy);
//       doc.text('m³', contentLeft + 72, yy);
//       yy += 4;

//       doc.setFont('helvetica', 'bold');
//       doc.text('Consumo:', contentLeft, yy);
//       doc.text(String(consumo), contentLeft + 24, yy);
//       doc.text('m³', contentLeft + 34, yy);
//       yy += 5;

//       // Línea separadora
//       doc.setLineWidth(0.2);
//       doc.line(contentLeft, yy, leftX + 85 - padding, yy);
//       yy += 4;

//       // Información de pago (más compacta)
//       doc.text('PAGO', contentLeft, yy);
//       yy += 4;

//       doc.setFont('helvetica', 'normal');
//       doc.text('Monto a cobrar:', contentLeft, yy);
//       doc.text(`Bs. ${montoCobrar.toFixed(2)}`, contentLeft + 57, yy);
//       yy += 4;

//       doc.text('Monto pagado:', contentLeft, yy);
//       doc.text(`Bs. ${montoPagado.toFixed(2)}`, contentLeft + 57, yy);
//       yy += 4;

//       doc.setFont('helvetica', 'bold');
//       doc.text('Cambio:', contentLeft, yy);
//       doc.text(`Bs. ${cambio.toFixed(2)}`, contentLeft + 57, yy);
//       yy += 6;

//       // Línea separadora
//       doc.setLineWidth(0.3);
//       doc.line(contentLeft, yy, leftX + 85 - padding, yy);
//       yy += 5;

//       // Firmas (dos campos: Cajero y Cliente)
//       doc.setFont('helvetica', 'normal');
//       doc.setFontSize(7);

//       // Cajero (izquierda)
//       doc.text('Cajero:', contentLeft, yy);
//       yy += 8;
//       doc.line(contentLeft, yy, contentLeft + 35, yy);

//       // Cliente (derecha) - volver a la misma altura inicial
//       yy -= 8;
//       const rightSide = contentLeft + 42;
//       doc.text('Cliente:', rightSide, yy);
//       yy += 8;
//       doc.line(rightSide, yy, rightSide + 35, yy);
//     };

//     // dibujar dos recibos lado a lado (duplicado para cortar verticalmente)
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const margin = 12;
//     const columnWidth = (pageWidth - margin * 2) / 2;
//     const receiptWidth = 85; // ancho del recibo
//     const topY = 18;

//     // Centrar cada recibo dentro de su columna
//     const leftColumnX = margin + (columnWidth - receiptWidth) / 2;
//     const rightColumnX = margin + columnWidth + (columnWidth - receiptWidth) / 2;

//     drawReceipt(leftColumnX, topY);
//     drawReceipt(rightColumnX, topY);

//     // línea de corte vertical punteada entre columnas
//     const cutX = pageWidth / 2;
//     try {
//       // @ts-ignore
//       doc.setLineDash([2, 2], 0);
//     } catch (e) {}
//     doc.setDrawColor(150);
//     doc.setLineWidth(0.3);
//     doc.line(cutX, 10, cutX, doc.internal.pageSize.getHeight() - 10);
//     try {
//       // @ts-ignore
//       doc.setLineDash([], 0);
//     } catch (e) {}

//     doc.save(`recibo_${form.nombre.replace(/\s+/g, '_') || 'recibo'}_${form.gestion || ''}_${form.fechaPago || ''}.pdf`);
//   }