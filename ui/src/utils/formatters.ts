export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(isoString: string): string {
  if (!isoString) return 'Fecha no disponible';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

export function getChannelLabel(channel: string): string {
  switch (channel) {
    case 'TARJETA_CREDITO_BCP':
      return 'Crédito BCP';
    case 'TARJETA_DEBITO_BCP':
      return 'Débito BCP';
    case 'YAPE':
      return 'Yape';
    case 'BCP_TRANSFERENCIA':
      return 'Transferencia BCP';
    case 'PLIN':
      return 'Plin';
    default:
      return channel.replace(/_/g, ' ');
  }
}
