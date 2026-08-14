export type UserRole = 'customer' | 'vendor' | 'rider';

export type VendorCategory = 'food' | 'pharmacy' | 'supermarket' | 'other';

export type Neighborhood =
  | 'Terminus'
  | 'Bukuru'
  | 'Rayfield'
  | 'Angwan Rukuba'
  | 'Farin Gada'
  | 'BBC/Kwararafa'
  | 'Naraguta';

export type OrderStatus =
  | 'pending'
  | 'shopping'
  | 'preparing'
  | 'ready'
  | 'on_the_way'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'wallet';

export type DeliveryMode = 'point_to_point' | 'shopper';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  neighborhood: Neighborhood;
  rating: number;
  reviewCount: number;
  deliveryMins: [number, number];
  deliveryFee: number;
  minOrder: number;
  commissionRate: number;
  accent: string;
  description: string;
  tags: string[];
  isOpen: boolean;
  icon: string;
}

export interface MenuItem {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  section: string;
  inStock: boolean;
  icon: string;
}

export interface CartLine {
  item: MenuItem;
  quantity: number;
}

export interface OrderLine {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  icon: string;
}

export interface Order {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: VendorCategory;
  customerName: string;
  customerPhone: string;
  neighborhood: Neighborhood;
  address: string;
  items: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: number;
  notes: string;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  deliveryMode: DeliveryMode;
  promoCode?: string;
  shoppingProgress?: number;
}

export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  rating: number;
  trips: number;
}

export const NEIGHBORHOODS: Neighborhood[] = [
  'Terminus',
  'Bukuru',
  'Rayfield',
  'Angwan Rukuba',
  'Farin Gada',
  'BBC/Kwararafa',
  'Naraguta',
];

export const CATEGORY_LABELS: Record<VendorCategory, string> = {
  food: 'Food',
  pharmacy: 'Pharmacy',
  supermarket: 'Supermarket',
  other: 'More',
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  shopping: 'Shopping',
  preparing: 'Preparing',
  ready: 'Ready for pickup',
  on_the_way: 'On the way',
  delivered: 'Delivered',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash on delivery',
  card: 'Card',
  wallet: 'JozGo Wallet',
};
