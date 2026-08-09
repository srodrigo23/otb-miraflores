
// Obtener la fecha actual en formato YYYY-MM-DD para el campo de fecha
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats an ISO date coming from the API as DD/MM/YYYY.
 *
 * A date-only string ("2026-08-06") is parsed as UTC midnight by the engine,
 * which in Bolivia (UTC-4) renders as the day before. Pinning the time makes it
 * local and keeps the printed date equal to the one that was picked.
 */
export const formatDate = (dateString: string) => {
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  const date = new Date(isDateOnly ? `${dateString}T00:00:00` : dateString);
  return date.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};