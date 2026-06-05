import { Payment } from '../entities/Payment';

const HEADERS: Array<keyof Payment> = [
  'id_pago',
  'email',
  'nombre',
  'curso',
  'importe',
  'moneda',
  'estado',
  'fecha',
  'refunded_at',
];

export function paymentsToCsv(payments: Payment[]): string {
  const rows = [HEADERS.join(',')];

  for (const payment of payments) {
    rows.push(
      HEADERS.map((header) => escapeCsvValue(payment[header])).join(',')
    );
  }

  return rows.join('\n');
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';

  const text = String(value);
  const escaped = text.replace(/"/g, '""');

  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
}
