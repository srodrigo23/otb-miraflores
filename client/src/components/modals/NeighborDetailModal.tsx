import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Card,
  CardBody,
  Chip,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from '@material-tailwind/react';
import {
  UserIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';

interface NeighborType {
  id: number;
  first_name: string;
  second_name: string;
  last_name: string;
  ci: string;
  phone_number: string;
  email: string;
}

interface MeterType {
  id: number;
  meter_code: string;
  label: string | null;
  is_active: boolean;
  installation_date: string | null;
  last_maintenance_date: string | null;
  notes: string | null;
  created_at: string;
}

interface DebtItemType {
  id: number;
  neighbor_id: number;
  debt_type_id: number;
  debt_type_name: string;
  amount: number;
  amount_paid: number;
  balance: number;
  reason: string;
  period: string | null;
  issue_date: string;
  due_date: string | null;
  paid_date: string | null;
  status: string;
  is_overdue: boolean;
  late_fee: number;
  discount: number;
  notes: string | null;
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
  collect_debt_id: number | null;
  payment_date: string;
  total_amount: number;
  payment_method: string | null;
  reference_number: string | null;
  received_by: string | null;
  notes: string | null;
  created_at: string;
  payment_details: PaymentDetailType[];
}

type NeighborDetailModalProps = {
  open: boolean;
  onClose: () => void;
  neighbor: NeighborType | null;
};

const STATUS_COLORS: { [key: string]: string } = {
  pending: 'amber',
  partial: 'blue',
  paid: 'green',
  overdue: 'red',
  cancelled: 'gray',
};

const STATUS_LABELS: { [key: string]: string } = {
  pending: 'Pendiente',
  partial: 'Pago Parcial',
  paid: 'Pagado',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
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

const NeighborDetailModal: React.FC<NeighborDetailModalProps> = ({
  open,
  onClose,
  neighbor,
}) => {
  const [meters, setMeters] = useState<MeterType[]>([]);
  const [debts, setDebts] = useState<DebtItemType[]>([]);
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const apiLink = 'http://127.0.0.1:8000';

  useEffect(() => {
    if (open && neighbor) {
      fetchNeighborData();
    }
  }, [open, neighbor]);

  const fetchNeighborData = async () => {
    if (!neighbor) return;

    setLoading(true);
    try {
      // Cargar medidores
      const metersResponse = await fetch(`${apiLink}/neighbors/${neighbor.id}/meters`);
      if (metersResponse.ok) {
        const metersData = await metersResponse.json();
        setMeters(metersData);
      }

      // Cargar deudas activas
      const debtsResponse = await fetch(`${apiLink}/neighbors/${neighbor.id}/debts/active`);
      if (debtsResponse.ok) {
        const debtsData = await debtsResponse.json();
        // El backend devuelve un objeto con debt_details, extraemos solo eso
        setDebts(debtsData.debt_details || []);
      }

      // Cargar pagos
      const paymentsResponse = await fetch(`${apiLink}/neighbors/${neighbor.id}/payments`);
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error('Error al cargar datos del vecino:', error);
      toast.error('Error al cargar los datos del vecino');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `Bs. ${amount.toFixed(2)}`;
  };

  const getFullName = () => {
    if (!neighbor) return '';
    return `${neighbor.first_name} ${neighbor.second_name || ''} ${neighbor.last_name}`.trim();
  };

  const tabsData = [
    {
      label: 'Información',
      value: 'info',
      icon: UserIcon,
    },
    {
      label: 'Medidores',
      value: 'meters',
      icon: WrenchScrewdriverIcon,
      badge: meters.length,
    },
    {
      label: 'Deudas Activas',
      value: 'debts',
      icon: CurrencyDollarIcon,
      badge: debts.filter((d) => d.status !== 'paid' && d.status !== 'cancelled').length,
    },
    {
      label: 'Pagos Realizados',
      value: 'payments',
      icon: BanknotesIcon,
      badge: payments.length,
    },
  ];

  return (
    <Dialog open={open} handler={onClose} size="xl">
      <DialogHeader>
        <div>
          <Typography variant="h4">Detalles del Vecino</Typography>
          <Typography variant="small" color="gray" className="font-normal">
            {getFullName()}
          </Typography>
        </div>
      </DialogHeader>
      <DialogBody className="overflow-auto max-h-[70vh]">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <ClipLoader size={50} />
          </div>
        ) : (
          <Tabs value={activeTab}>
            <TabsHeader
              className="bg-blue-gray-50/50"
              indicatorProps={{
                className: 'bg-blue-500 shadow-none',
              }}
            >
              {tabsData.map(({ label, value, icon: Icon, badge }) => (
                <Tab
                  key={value}
                  value={value}
                  onClick={() => setActiveTab(value)}
                  className={activeTab === value ? 'text-white' : ''}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {label}
                    {badge !== undefined && badge > 0 && (
                      <Chip
                        size="sm"
                        value={badge}
                        color="blue"
                        className="rounded-full"
                      />
                    )}
                  </div>
                </Tab>
              ))}
            </TabsHeader>
            <TabsBody>
              {/* Tab de Información Personal */}
              <TabPanel value="info" className="p-0 pt-4">
                <Card>
                  <CardBody>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Typography variant="small" color="blue-gray" className="font-semibold mb-1">
                          Primer Nombre
                        </Typography>
                        <Typography variant="paragraph" color="blue-gray">
                          {neighbor?.first_name}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="small" color="blue-gray" className="font-semibold mb-1">
                          Segundo Nombre
                        </Typography>
                        <Typography variant="paragraph" color="blue-gray">
                          {neighbor?.second_name || '-'}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="small" color="blue-gray" className="font-semibold mb-1">
                          Apellido
                        </Typography>
                        <Typography variant="paragraph" color="blue-gray">
                          {neighbor?.last_name}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="small" color="blue-gray" className="font-semibold mb-1">
                          Cédula de Identidad
                        </Typography>
                        <Typography variant="paragraph" color="blue-gray">
                          {neighbor?.ci}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="small" color="blue-gray" className="font-semibold mb-1">
                          Teléfono
                        </Typography>
                        <Typography variant="paragraph" color="blue-gray">
                          {neighbor?.phone_number}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="small" color="blue-gray" className="font-semibold mb-1">
                          Email
                        </Typography>
                        <Typography variant="paragraph" color="blue-gray">
                          {neighbor?.email || '-'}
                        </Typography>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Tab de Medidores */}
              <TabPanel value="meters" className="p-0 pt-4">
                {meters.length === 0 ? (
                  <Card>
                    <CardBody>
                      <Typography className="text-center" color="gray">
                        No hay medidores registrados para este vecino
                      </Typography>
                    </CardBody>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {meters.map((meter) => (
                      <Card key={meter.id}>
                        <CardBody>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <Typography variant="h6" color="blue-gray">
                                {meter.label || `Medidor ${meter.meter_code}`}
                              </Typography>
                              <Typography variant="small" color="gray">
                                Código: {meter.meter_code}
                              </Typography>
                            </div>
                            <Chip
                              size="sm"
                              value={meter.is_active ? 'Activo' : 'Inactivo'}
                              color={meter.is_active ? 'green' : 'red'}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Typography variant="small" color="blue-gray" className="font-semibold">
                                Fecha de Instalación
                              </Typography>
                              <Typography variant="small" color="gray">
                                {formatDate(meter.installation_date)}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="small" color="blue-gray" className="font-semibold">
                                Último Mantenimiento
                              </Typography>
                              <Typography variant="small" color="gray">
                                {formatDate(meter.last_maintenance_date)}
                              </Typography>
                            </div>
                          </div>
                          {meter.notes && (
                            <div className="mt-3">
                              <Typography variant="small" color="blue-gray" className="font-semibold">
                                Notas
                              </Typography>
                              <Typography variant="small" color="gray">
                                {meter.notes}
                              </Typography>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </TabPanel>

              {/* Tab de Deudas */}
              <TabPanel value="debts" className="p-0 pt-4">
                {debts.length === 0 ? (
                  <Card>
                    <CardBody>
                      <Typography className="text-center" color="gray">
                        No hay deudas activas para este vecino
                      </Typography>
                    </CardBody>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {debts.map((debt) => (
                      <Card key={debt.id} className={debt.is_overdue ? 'border-2 border-red-300' : ''}>
                        <CardBody>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <Typography variant="h6" color="blue-gray">
                                {debt.reason}
                              </Typography>
                              <Typography variant="small" color="gray">
                                {debt.debt_type_name} {debt.period ? `- ${debt.period}` : ''}
                              </Typography>
                            </div>
                            <Chip
                              size="sm"
                              value={STATUS_LABELS[debt.status] || debt.status}
                              color={(STATUS_COLORS[debt.status] as any) || 'gray'}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                              <Typography variant="small" color="blue-gray" className="font-semibold">
                                Monto Total
                              </Typography>
                              <Typography variant="small" color="blue-gray" className="font-bold">
                                {formatCurrency(debt.amount)}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="small" color="blue-gray" className="font-semibold">
                                Pagado
                              </Typography>
                              <Typography variant="small" color="green">
                                {formatCurrency(debt.amount_paid)}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="small" color="blue-gray" className="font-semibold">
                                Saldo
                              </Typography>
                              <Typography variant="small" color="red" className="font-bold">
                                {formatCurrency(debt.balance)}
                              </Typography>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Typography variant="small" color="blue-gray" className="font-semibold">
                                Fecha de Emisión
                              </Typography>
                              <Typography variant="small" color="gray">
                                {formatDate(debt.issue_date)}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="small" color="blue-gray" className="font-semibold">
                                Fecha de Vencimiento
                              </Typography>
                              <Typography variant="small" color={debt.is_overdue ? 'red' : 'gray'}>
                                {formatDate(debt.due_date)} {debt.is_overdue && '(Vencido)'}
                              </Typography>
                            </div>
                          </div>

                          {(debt.late_fee > 0 || debt.discount > 0) && (
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              {debt.late_fee > 0 && (
                                <div>
                                  <Typography variant="small" color="blue-gray" className="font-semibold">
                                    Recargo por Mora
                                  </Typography>
                                  <Typography variant="small" color="red">
                                    {formatCurrency(debt.late_fee)}
                                  </Typography>
                                </div>
                              )}
                              {debt.discount > 0 && (
                                <div>
                                  <Typography variant="small" color="blue-gray" className="font-semibold">
                                    Descuento
                                  </Typography>
                                  <Typography variant="small" color="green">
                                    {formatCurrency(debt.discount)}
                                  </Typography>
                                </div>
                              )}
                            </div>
                          )}

                          {debt.notes && (
                            <div className="mt-3">
                              <Typography variant="small" color="blue-gray" className="font-semibold">
                                Notas
                              </Typography>
                              <Typography variant="small" color="gray">
                                {debt.notes}
                              </Typography>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    ))}

                    {/* Resumen de deudas */}
                    <Card className="bg-blue-gray-50">
                      <CardBody>
                        <div className="flex justify-between items-center">
                          <Typography variant="h6" color="blue-gray">
                            Total Adeudado
                          </Typography>
                          <Typography variant="h5" color="red" className="font-bold">
                            {formatCurrency(
                              debts
                                .filter((d) => d.status !== 'paid' && d.status !== 'cancelled')
                                .reduce((sum, debt) => sum + debt.balance, 0)
                            )}
                          </Typography>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}
              </TabPanel>

              {/* Tab de Pagos */}
              <TabPanel value="payments" className="p-0 pt-4">
                {payments.length === 0 ? (
                  <Card>
                    <CardBody>
                      <Typography className="text-center" color="gray">
                        No hay pagos registrados para este vecino
                      </Typography>
                    </CardBody>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <Card key={payment.id}>
                        <CardBody>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <Typography variant="h6" color="blue-gray">
                                Pago #{payment.id}
                              </Typography>
                              <Typography variant="small" color="gray">
                                Fecha: {formatDate(payment.payment_date)}
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
                                  className="mt-1"
                                />
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {payment.reference_number && (
                              <div>
                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                  Número de Referencia
                                </Typography>
                                <Typography variant="small" color="gray">
                                  {payment.reference_number}
                                </Typography>
                              </div>
                            )}
                            {payment.received_by && (
                              <div>
                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                  Recibido por
                                </Typography>
                                <Typography variant="small" color="gray">
                                  {payment.received_by}
                                </Typography>
                              </div>
                            )}
                          </div>

                          {payment.notes && (
                            <div className="mb-3">
                              <Typography variant="small" color="blue-gray" className="font-semibold">
                                Notas
                              </Typography>
                              <Typography variant="small" color="gray">
                                {payment.notes}
                              </Typography>
                            </div>
                          )}

                          {/* Detalles de aplicación del pago */}
                          {payment.payment_details.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-blue-gray-100">
                              <Typography variant="small" color="blue-gray" className="font-semibold mb-2">
                                Aplicado a:
                              </Typography>
                              <div className="space-y-2">
                                {payment.payment_details.map((detail) => (
                                  <div key={detail.id} className="bg-blue-gray-50 p-2 rounded">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                          {detail.debt_reason}
                                        </Typography>
                                        <Typography variant="small" color="gray">
                                          {detail.debt_type_name}
                                        </Typography>
                                      </div>
                                      <Typography variant="small" color="green" className="font-bold">
                                        {formatCurrency(detail.amount_applied)}
                                      </Typography>
                                    </div>
                                    {detail.previous_balance !== null && detail.new_balance !== null && (
                                      <div className="flex gap-4 mt-1">
                                        <Typography variant="small" color="gray">
                                          Saldo anterior: {formatCurrency(detail.previous_balance)}
                                        </Typography>
                                        <Typography variant="small" color="gray">
                                          Nuevo saldo: {formatCurrency(detail.new_balance)}
                                        </Typography>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    ))}

                    {/* Resumen de pagos */}
                    <Card className="bg-green-50">
                      <CardBody>
                        <div className="flex justify-between items-center">
                          <Typography variant="h6" color="blue-gray">
                            Total Pagado
                          </Typography>
                          <Typography variant="h5" color="green" className="font-bold">
                            {formatCurrency(
                              payments.reduce((sum, payment) => sum + payment.total_amount, 0)
                            )}
                          </Typography>
                        </div>
                        <Typography variant="small" color="gray" className="mt-1">
                          {payments.length} pago{payments.length !== 1 ? 's' : ''} registrado{payments.length !== 1 ? 's' : ''}
                        </Typography>
                      </CardBody>
                    </Card>
                  </div>
                )}
              </TabPanel>
            </TabsBody>
          </Tabs>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="gradient" color="blue" onClick={onClose}>
          <span>Cerrar</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default NeighborDetailModal;
