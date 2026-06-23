import { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Input,
  Select,
  Option,
  Checkbox,
  Card,
  CardBody,
  Chip,
} from '@material-tailwind/react';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';

interface CollectDebtType {
  id: number;
  collect_date: string;
  period: string | null;
  collector_name: string | null;
  location: string | null;
  status: string;
  total_payments: number;
  total_collected: number;
  total_neighbors_paid: number;
  notes: string | null;
}

interface NeighborType {
  id: number;
  first_name: string;
  second_name: string;
  last_name: string;
  ci: string;
}

interface DebtItemType {
  id: number;
  debt_type_name: string;
  amount: number;
  balance: number;
  reason: string;
  period: string | null;
  status: string;
}

interface PaymentDetailType {
  id: number;
  debt_item_id: number;
  debt_reason: string;
  debt_type_name: string;
  amount_applied: number;
  previous_balance: number | null;
  new_balance: number | null;
  notes: string | null;
}

interface PaymentType {
  id: number;
  neighbor_id: number;
  neighbor_name: string;
  neighbor_ci: string;
  payment_date: string;
  total_amount: number;
  payment_method: string | null;
  reference_number: string | null;
  received_by: string | null;
  notes: string | null;
  payment_details: PaymentDetailType[];
}

type CollectDebtPaymentsModalProps = {
  open: boolean;
  onClose: () => void;
  collectDebt: CollectDebtType | null;
};

const PAYMENT_METHOD_LABELS: { [key: string]: string } = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  qr: 'QR',
  card: 'Tarjeta',
};

const PAYMENT_METHOD_COLORS: { [key: string]: string } = {
  cash: 'green',
  transfer: 'blue',
  qr: 'purple',
  card: 'amber',
};

const CollectDebtPaymentsModal: React.FC<CollectDebtPaymentsModalProps> = ({
  open,
  onClose,
  collectDebt,
}) => {
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [neighbors, setNeighbors] = useState<NeighborType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  // Form state
  const [selectedNeighbor, setSelectedNeighbor] = useState<number | null>(null);
  const [neighborDebts, setNeighborDebts] = useState<DebtItemType[]>([]);
  const [selectedDebts, setSelectedDebts] = useState<{ [key: number]: number }>({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const apiLink = 'http://127.0.0.1:8000';

  useEffect(() => {
    if (open && collectDebt) {
      fetchPayments();
      fetchNeighbors();
    }
  }, [open, collectDebt]);

  useEffect(() => {
    // Calcular total cuando cambian las deudas seleccionadas
    const total = Object.values(selectedDebts).reduce((sum, amount) => sum + amount, 0);
    setTotalAmount(total);
  }, [selectedDebts]);

  const fetchPayments = async () => {
    if (!collectDebt) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiLink}/collect-debts/${collectDebt.id}/payments`);
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  const fetchNeighbors = async () => {
    try {
      const response = await fetch(`${apiLink}/neighbors/`);
      const data = await response.json();
      setNeighbors(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNeighborDebts = async (neighborId: number) => {
    try {
      const response = await fetch(`${apiLink}/neighbors/${neighborId}/debts/active`);
      const data = await response.json();
      setNeighborDebts(data.debt_details || []);
      setSelectedDebts({});
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar las deudas del vecino');
    }
  };

  const handleNeighborChange = (neighborId: string) => {
    const id = parseInt(neighborId);
    setSelectedNeighbor(id);
    fetchNeighborDebts(id);
  };

  const handleDebtToggle = (debtId: number, balance: number) => {
    setSelectedDebts(prev => {
      const newSelected = { ...prev };
      if (newSelected[debtId]) {
        delete newSelected[debtId];
      } else {
        newSelected[debtId] = balance;
      }
      return newSelected;
    });
  };

  const handleDebtAmountChange = (debtId: number, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setSelectedDebts(prev => ({
      ...prev,
      [debtId]: numAmount
    }));
  };

  const generateReceipt = (paymentData: any, neighborName: string) => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();

    // Configurar el PDF para usar solo la mitad superior de la hoja
    const pageHeight = doc.internal.pageSize.height;
    const halfPage = pageHeight / 2;

    let yPos = 20;

    // Encabezado
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('OTB MIRAFLORES', 105, yPos, { align: 'center' });

    yPos += 10;
    doc.setFontSize(16);
    doc.text('RECIBO DE COBRO', 105, yPos, { align: 'center' });

    yPos += 15;

    // Información del recibo
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Recibo No: ${paymentData.id.toString().padStart(5, '0')}`, 20, yPos);
    doc.text(`Fecha: ${formatDate(paymentData.payment_date)}`, 150, yPos);

    yPos += 10;

    // Línea separadora
    doc.line(20, yPos, 190, yPos);

    yPos += 10;

    // Información del vecino
    doc.setFont('helvetica', 'bold');
    doc.text('Recibí de:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(neighborName, 50, yPos);

    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('CI:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    const selectedNeighborData = neighbors.find(n => n.id === selectedNeighbor);
    doc.text(selectedNeighborData?.ci || '', 50, yPos);

    yPos += 12;

    // Detalles de pago
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Pagos:', 20, yPos);

    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    Object.entries(selectedDebts).forEach(([debtId, amount]) => {
      const debt = neighborDebts.find(d => d.id === parseInt(debtId));
      if (debt) {
        doc.text(`• ${debt.reason}`, 25, yPos);
        doc.text(`Bs. ${amount.toFixed(2)}`, 170, yPos, { align: 'right' });
        yPos += 5;
      }
    });

    yPos += 5;

    // Total
    doc.line(140, yPos, 190, yPos);
    yPos += 7;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 140, yPos);
    doc.text(`Bs. ${totalAmount.toFixed(2)}`, 190, yPos, { align: 'right' });

    yPos += 10;

    // Método de pago
    if (paymentMethod) {
      const paymentMethods: { [key: string]: string } = {
        cash: 'Efectivo',
        transfer: 'Transferencia',
        qr: 'QR',
        card: 'Tarjeta'
      };
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Método de pago: ${paymentMethods[paymentMethod] || paymentMethod}`, 20, yPos);
      yPos += 5;
    }

    if (referenceNumber) {
      doc.text(`Referencia: ${referenceNumber}`, 20, yPos);
      yPos += 10;
    }

    // Firma
    yPos += 10;
    doc.line(120, yPos, 190, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.text(`Recibido por: ${receivedBy || '_______________'}`, 155, yPos, { align: 'center' });

    // Línea de corte
    doc.setLineDash([3, 3]);
    doc.line(10, halfPage, 200, halfPage);

    // Guardar PDF
    doc.save(`recibo_${paymentData.id.toString().padStart(5, '0')}.pdf`);
  };

  const handleSubmitPayment = async () => {
    if (!selectedNeighbor) {
      toast.error('Seleccione un vecino');
      return;
    }

    if (totalAmount <= 0) {
      toast.error('El monto total debe ser mayor a 0');
      return;
    }

    setSaving(true);
    try {
      const debtItems = Object.entries(selectedDebts).map(([debtId, amount]) => ({
        debt_item_id: parseInt(debtId),
        amount_applied: amount
      }));

      const response = await fetch(
        `${apiLink}/collect-debts/${collectDebt?.id}/payments?neighbor_id=${selectedNeighbor}&total_amount=${totalAmount}&payment_method=${paymentMethod}&reference_number=${referenceNumber}&received_by=${receivedBy}&notes=${notes}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ debt_items: debtItems }),
        }
      );

      if (response.ok) {
        const paymentData = await response.json();
        toast.success('Pago registrado exitosamente');

        // Generar recibo PDF
        const selectedNeighborData = neighbors.find(n => n.id === selectedNeighbor);
        const neighborName = selectedNeighborData
          ? `${selectedNeighborData.first_name} ${selectedNeighborData.second_name || ''} ${selectedNeighborData.last_name}`.trim()
          : '';

        generateReceipt(paymentData, neighborName);

        fetchPayments();
        resetForm();
        setShowAddPayment(false);
      } else {
        toast.error('Error al registrar el pago');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al registrar el pago');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedNeighbor(null);
    setNeighborDebts([]);
    setSelectedDebts({});
    setTotalAmount(0);
    setPaymentMethod('cash');
    setReferenceNumber('');
    setReceivedBy('');
    setNotes('');
    setSearchTerm('');
  };

  const getFullName = (neighbor: NeighborType) => {
    return `${neighbor.first_name} ${neighbor.second_name || ''} ${neighbor.last_name}`.trim();
  };

  // Filtrar vecinos basado en búsqueda
  const filteredNeighbors = useMemo(() => {
    if (!searchTerm) return neighbors;

    const searchLower = searchTerm.toLowerCase();
    return neighbors.filter((neighbor) => {
      const fullName = `${neighbor.first_name} ${neighbor.second_name || ''} ${neighbor.last_name}`.trim().toLowerCase();
      const ci = neighbor.ci.toLowerCase();
      return fullName.includes(searchLower) || ci.includes(searchLower);
    });
  }, [neighbors, searchTerm]);

  const formatCurrency = (amount: number) => {
    return `Bs. ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Dialog open={open} handler={onClose} size="xl">
      <DialogHeader>
        <div className="w-full">
          <Typography variant="h4">
            Pagos de Recaudación - {collectDebt?.period || formatDate(collectDebt?.collect_date || '')}
          </Typography>
          <Typography variant="small" color="gray" className="font-normal">
            {collectDebt?.location || 'Sin ubicación'} | Total recaudado: {formatCurrency(collectDebt?.total_collected || 0)}
          </Typography>
        </div>
      </DialogHeader>
      <DialogBody className="overflow-auto max-h-[70vh]">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <ClipLoader size={50} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Botón para agregar nuevo pago */}
            <div className="flex justify-between items-center">
              <Typography variant="h5">Pagos Registrados ({payments.length})</Typography>
              <Button
                size="sm"
                onClick={() => setShowAddPayment(!showAddPayment)}
                color={showAddPayment ? 'red' : 'green'}
              >
                {showAddPayment ? 'Cancelar' : 'Nuevo Pago'}
              </Button>
            </div>

            {/* Formulario para nuevo pago */}
            {showAddPayment && (
              <Card className="bg-blue-gray-50">
                <CardBody>
                  <Typography variant="h6" className="mb-4">Registrar Nuevo Pago</Typography>

                  <div className="space-y-4">
                    {/* Buscar y seleccionar vecino */}
                    <div className="space-y-2">
                      <Input
                        label="Buscar Vecino (por nombre o CI)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        crossOrigin={undefined}
                        placeholder="Escriba para buscar..."
                      />
                      <Select
                        label="Seleccionar Vecino"
                        value={selectedNeighbor?.toString()}
                        onChange={(val) => handleNeighborChange(val!)}
                      >
                        {filteredNeighbors.length === 0 ? (
                          <Option disabled value="">
                            No se encontraron vecinos
                          </Option>
                        ) : (
                          filteredNeighbors.map((neighbor) => (
                            <Option key={neighbor.id} value={neighbor.id.toString()}>
                              {getFullName(neighbor)} - CI: {neighbor.ci}
                            </Option>
                          ))
                        )}
                      </Select>
                      {searchTerm && (
                        <Typography variant="small" color="gray">
                          Mostrando {filteredNeighbors.length} de {neighbors.length} vecinos
                        </Typography>
                      )}
                    </div>

                    {/* Deudas del vecino */}
                    {selectedNeighbor && neighborDebts.length > 0 && (
                      <div>
                        <Typography variant="small" className="mb-2 font-semibold">
                          Deudas Activas:
                        </Typography>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {neighborDebts.map((debt) => (
                            <div key={debt.id} className="flex items-center gap-2 bg-white p-2 rounded">
                              <Checkbox
                                checked={!!selectedDebts[debt.id]}
                                onChange={() => handleDebtToggle(debt.id, debt.balance)}
                                crossOrigin={undefined}
                              />
                              <div className="flex-1">
                                <Typography variant="small" className="font-medium">
                                  {debt.reason} {debt.period ? `- ${debt.period}` : ''}
                                </Typography>
                                <Typography variant="small" color="gray">
                                  Saldo: {formatCurrency(debt.balance)}
                                </Typography>
                              </div>
                              {selectedDebts[debt.id] !== undefined && (
                                <Input
                                  type="number"
                                  label="Monto a pagar (Bs.)"
                                  value={selectedDebts[debt.id]}
                                  onChange={(e) => handleDebtAmountChange(debt.id, e.target.value)}
                                  crossOrigin={undefined}
                                  className="!w-40"
                                  step="0.01"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedNeighbor && neighborDebts.length === 0 && (
                      <Typography variant="small" color="gray" className="text-center py-4">
                        Este vecino no tiene deudas activas
                      </Typography>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label="Monto Total (Bs.)"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                        crossOrigin={undefined}
                        step="0.01"
                      />
                      <Select
                        label="Método de Pago"
                        value={paymentMethod}
                        onChange={(val) => setPaymentMethod(val!)}
                      >
                        <Option value="cash">Efectivo</Option>
                        <Option value="transfer">Transferencia</Option>
                        <Option value="qr">QR</Option>
                        <Option value="card">Tarjeta</Option>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Número de Referencia"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        crossOrigin={undefined}
                      />
                      <Input
                        label="Recibido Por"
                        value={receivedBy}
                        onChange={(e) => setReceivedBy(e.target.value)}
                        crossOrigin={undefined}
                      />
                    </div>

                    <Input
                      label="Notas"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      crossOrigin={undefined}
                    />

                    <div className="flex justify-between items-center pt-4 border-t">
                      <Typography variant="h6">
                        Total a Pagar: {formatCurrency(totalAmount)}
                      </Typography>
                      <Button
                        onClick={handleSubmitPayment}
                        disabled={saving || !selectedNeighbor || totalAmount <= 0}
                        color="green"
                      >
                        {saving ? 'Guardando...' : 'Registrar Pago'}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Lista de pagos */}
            <div className="space-y-3">
              {payments.length === 0 ? (
                <Card>
                  <CardBody>
                    <Typography className="text-center" color="gray">
                      No hay pagos registrados en esta recaudación
                    </Typography>
                  </CardBody>
                </Card>
              ) : (
                payments.map((payment) => (
                  <Card key={payment.id}>
                    <CardBody>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Typography variant="h6">{payment.neighbor_name}</Typography>
                          <Typography variant="small" color="gray">
                            CI: {payment.neighbor_ci} | Fecha: {formatDate(payment.payment_date)}
                          </Typography>
                        </div>
                        <div className="text-right">
                          <Typography variant="h5" color="green" className="font-bold">
                            {formatCurrency(payment.total_amount)}
                          </Typography>
                          {payment.payment_method && (
                            <Chip
                              size="sm"
                              value={PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method}
                              color={(PAYMENT_METHOD_COLORS[payment.payment_method] as any) || 'gray'}
                            />
                          )}
                        </div>
                      </div>

                      {payment.reference_number && (
                        <Typography variant="small" color="gray">
                          Ref: {payment.reference_number}
                        </Typography>
                      )}

                      {payment.received_by && (
                        <Typography variant="small" color="gray">
                          Recibido por: {payment.received_by}
                        </Typography>
                      )}

                      {payment.payment_details.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-gray-100">
                          <Typography variant="small" className="font-semibold mb-2">
                            Aplicado a:
                          </Typography>
                          {payment.payment_details.map((detail) => (
                            <div key={detail.id} className="flex justify-between text-sm py-1">
                              <span>{detail.debt_reason} - {detail.debt_type_name}</span>
                              <span className="font-semibold">{formatCurrency(detail.amount_applied)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="gradient" color="blue" onClick={onClose}>
          Cerrar
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CollectDebtPaymentsModal;
