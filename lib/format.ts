import { OrderStatus, VendorCategory } from './types';

export function formatNaira(amount: number): string {
  const rounded = Math.round(amount);
  return `₦${rounded.toLocaleString('en-NG')}`;
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${mins} ${ampm}`;
}

export function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function deliveryFeeFor(
  category: VendorCategory,
  neighborhood: string,
  vendorNeighborhood: string
): number {
  const base: Record<VendorCategory, number> = {
    food: 500,
    pharmacy: 400,
    supermarket: 700,
    other: 600,
  };
  const sameZone = neighborhood === vendorNeighborhood;
  return sameZone ? base[category] : base[category] + 350;
}

export function etaFor(status: OrderStatus, category: VendorCategory): string {
  if (status === 'delivered') return 'Delivered';
  if (status === 'on_the_way') return '8–14 min';
  if (status === 'ready') return 'Rider arriving';
  if (status === 'shopping') return 'Shopping now';
  if (status === 'preparing') return category === 'food' ? '18–28 min' : '12–20 min';
  if (status === 'pending') return 'Confirming…';
  return '—';
}

export function nextVendorStatus(status: OrderStatus, category: VendorCategory): OrderStatus | null {
  if (status === 'pending') {
    return category === 'supermarket' ? 'shopping' : 'preparing';
  }
  if (status === 'shopping') return 'ready';
  if (status === 'preparing') return 'ready';
  return null;
}

export function statusColor(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return '#F5B942';
    case 'shopping':
      return '#3B82F6';
    case 'preparing':
      return '#FF5A36';
    case 'ready':
      return '#0EA968';
    case 'on_the_way':
      return '#7C5CFC';
    case 'delivered':
      return '#0EA968';
    case 'rejected':
    case 'cancelled':
      return '#E23B3B';
    default:
      return '#7A8094';
  }
}
