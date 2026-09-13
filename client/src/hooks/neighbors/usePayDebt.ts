import { toast } from 'react-toastify';

import useFetchData from '../useFetchData';
import { apiLink } from '../../config';

/** What the collector fills in. The amount and the moment are server-side */
export type PayDebtPayload = {
  received_by: string | null;
};

export type CreatedPayment = {
  id: number;
  amount: number;
  /** When the server stamped it; null only for the seeded history */
  paid_at: string | null;
  /** The id, zero padded by the API. This is the receipt number */
  receipt_number: string;
  /** Opaque id the receipt QR points at */
  reference: string;
};
/** Detail the API sends back on a rejected payment, e.g. an already paid debt */
type ApiError = { detail?: string };

export const usePayDebt = () => {
  // Runs on demand only, so it must not start out loading
  const {
    data,
    isLoading: isSaving,
    error,
    execute,
  } = useFetchData<CreatedPayment>({ initialLoading: false });

  /** Resolves to the stored payment, or null if it was rejected */
  const payDebt = async (debtId: number, payload: PayDebtPayload) => {
    const result = await execute(`${apiLink}/debts/${debtId}/payment`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (result?.ok) {
      toast.success('Pago registrado correctamente');
      return result.data as CreatedPayment;
    }

    // The router explains an already paid, annulled or zero-amount debt
    const detail = (result?.data as ApiError | null)?.detail;
    toast.error(
      typeof detail === 'string' ? detail : 'No se pudo registrar el pago',
    );
    return null;
  };

  return { payDebt, isSaving, data, error };
};

export default usePayDebt;
