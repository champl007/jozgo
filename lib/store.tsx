import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CartLine,
  DeliveryMode,
  MenuItem,
  Neighborhood,
  Order,
  OrderStatus,
  PaymentMethod,
  UserRole,
  Vendor,
  VendorCategory,
} from './types';
import { CURRENT_CUSTOMER, CURRENT_RIDER, CURRENT_VENDOR_ID, MENU, SEED_ORDERS, VENDORS } from './data';
import { deliveryFeeFor } from './format';

const STORAGE_KEY = 'jozgo.v1';

interface Persisted {
  role: UserRole | null;
  neighborhood: Neighborhood;
  cart: CartLine[];
  orders: Order[];
  menu: MenuItem[];
  vendors: Vendor[];
  wallet: number;
  riderOnline: boolean;
  vendorId: string;
}

interface StoreValue {
  ready: boolean;
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  neighborhood: Neighborhood;
  setNeighborhood: (n: Neighborhood) => void;
  cart: CartLine[];
  cartVendor: Vendor | undefined;
  cartCount: number;
  cartSubtotal: number;
  addToCart: (item: MenuItem) => { ok: boolean; reason?: string };
  setQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
  orders: Order[];
  placeOrder: (payload: {
    paymentMethod: PaymentMethod;
    address: string;
    notes: string;
    promoCode?: string;
  }) => Order | null;
  updateOrderStatus: (id: string, status: OrderStatus, extra?: Partial<Order>) => void;
  assignRider: (id: string) => void;
  menu: MenuItem[];
  vendors: Vendor[];
  upsertItem: (item: MenuItem) => void;
  toggleStock: (itemId: string) => void;
  deleteItem: (itemId: string) => void;
  wallet: number;
  topUpWallet: (amount: number) => void;
  riderOnline: boolean;
  setRiderOnline: (v: boolean) => void;
  vendorId: string;
  setVendorId: (id: string) => void;
  activeVendor: Vendor | undefined;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadDefaults(): Persisted {
  return {
    role: null,
    neighborhood: 'Angwan Rukuba',
    cart: [],
    orders: SEED_ORDERS,
    menu: MENU,
    vendors: VENDORS,
    wallet: 4200,
    riderOnline: false,
    vendorId: CURRENT_VENDOR_ID,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(loadDefaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Persisted>;
          setState((prev) => ({
            ...prev,
            ...parsed,
            vendors: VENDORS,
            menu: parsed.menu && parsed.menu.length ? parsed.menu : MENU,
            orders: parsed.orders && parsed.orders.length ? parsed.orders : SEED_ORDERS,
          }));
        }
      } catch {
        // local cache unavailable — continue with seed data
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const cartVendor = useMemo(() => {
    const vid = state.cart[0]?.item.vendorId;
    return state.vendors.find((v) => v.id === vid);
  }, [state.cart, state.vendors]);

  const cartCount = useMemo(
    () => state.cart.reduce((sum, line) => sum + line.quantity, 0),
    [state.cart]
  );

  const cartSubtotal = useMemo(
    () => state.cart.reduce((sum, line) => sum + line.item.price * line.quantity, 0),
    [state.cart]
  );

  const activeVendor = useMemo(
    () => state.vendors.find((v) => v.id === state.vendorId),
    [state.vendors, state.vendorId]
  );

  const setRole = useCallback((role: UserRole | null) => {
    setState((s) => ({ ...s, role }));
  }, []);

  const setNeighborhood = useCallback((neighborhood: Neighborhood) => {
    setState((s) => ({ ...s, neighborhood }));
  }, []);

  const addToCart = useCallback((item: MenuItem) => {
    let result: { ok: boolean; reason?: string } = { ok: true };
    setState((s) => {
      if (s.cart.length && s.cart[0].item.vendorId !== item.vendorId) {
        result = { ok: false, reason: 'Cart holds items from another vendor. Clear it first.' };
        return s;
      }
      if (!item.inStock) {
        result = { ok: false, reason: 'This item is out of stock.' };
        return s;
      }
      const existing = s.cart.find((l) => l.item.id === item.id);
      const cart = existing
        ? s.cart.map((l) => (l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l))
        : [...s.cart, { item, quantity: 1 }];
      return { ...s, cart };
    });
    return result;
  }, []);

  const setQty = useCallback((itemId: string, qty: number) => {
    setState((s) => ({
      ...s,
      cart: qty <= 0 ? s.cart.filter((l) => l.item.id !== itemId) : s.cart.map((l) => (l.item.id === itemId ? { ...l, quantity: qty } : l)),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState((s) => ({ ...s, cart: [] }));
  }, []);

  const placeOrder = useCallback(
    (payload: { paymentMethod: PaymentMethod; address: string; notes: string; promoCode?: string }) => {
      if (!state.cart.length || !cartVendor) return null;
      const subtotal = state.cart.reduce((sum, l) => sum + l.item.price * l.quantity, 0);
      const deliveryFee = deliveryFeeFor(cartVendor.category, state.neighborhood, cartVendor.neighborhood);
      let discount = 0;
      const code = (payload.promoCode || '').trim().toUpperCase();
      if (code === 'JOZ200' && cartVendor.category === 'food' && subtotal >= 2500) discount = 200;
      if (code === 'PHARM50' && cartVendor.category === 'pharmacy' && subtotal >= 3000) discount = deliveryFee;
      if (code === 'MARKET' && cartVendor.category === 'supermarket') discount = 200;
      const total = Math.max(0, subtotal + deliveryFee - discount);
      if (payload.paymentMethod === 'wallet' && state.wallet < total) return null;
      const deliveryMode: DeliveryMode = cartVendor.category === 'supermarket' ? 'shopper' : 'point_to_point';
      const order: Order = {
        id: `JG-${Math.floor(24020 + Math.random() * 800)}`,
        vendorId: cartVendor.id,
        vendorName: cartVendor.name,
        vendorCategory: cartVendor.category,
        customerName: CURRENT_CUSTOMER.name,
        customerPhone: CURRENT_CUSTOMER.phone,
        neighborhood: state.neighborhood,
        address: payload.address,
        items: state.cart.map((l) => ({
          itemId: l.item.id,
          name: l.item.name,
          price: l.item.price,
          quantity: l.quantity,
          icon: l.item.icon,
        })),
        subtotal,
        deliveryFee,
        discount,
        total,
        paymentMethod: payload.paymentMethod,
        status: 'pending',
        createdAt: Date.now(),
        notes: payload.notes,
        deliveryMode,
        promoCode: code || undefined,
      };
      setState((s) => {
        if (!s.cart.length) return s;
        return {
          ...s,
          cart: [],
          orders: [order, ...s.orders],
          wallet: payload.paymentMethod === 'wallet' ? s.wallet - total : s.wallet,
        };
      });
      return order;
    },
    [cartVendor, state.cart, state.neighborhood, state.wallet]
  );

  const updateOrderStatus = useCallback((id: string, status: OrderStatus, extra?: Partial<Order>) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? { ...o, status, ...extra } : o)),
    }));
  }, []);

  const assignRider = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === id
          ? {
              ...o,
              riderId: CURRENT_RIDER.id,
              riderName: CURRENT_RIDER.name,
              riderPhone: CURRENT_RIDER.phone,
              status: o.status === 'ready' || o.status === 'shopping' || o.status === 'preparing' || o.status === 'pending'
                ? o.deliveryMode === 'shopper' && o.status !== 'ready'
                  ? 'shopping'
                  : o.status === 'pending'
                    ? o.deliveryMode === 'shopper'
                      ? 'shopping'
                      : 'preparing'
                    : o.status
                : o.status,
            }
          : o
      ),
    }));
  }, []);

  const upsertItem = useCallback((item: MenuItem) => {
    setState((s) => {
      const exists = s.menu.some((m) => m.id === item.id);
      return { ...s, menu: exists ? s.menu.map((m) => (m.id === item.id ? item : m)) : [item, ...s.menu] };
    });
  }, []);

  const toggleStock = useCallback((itemId: string) => {
    setState((s) => ({
      ...s,
      menu: s.menu.map((m) => (m.id === itemId ? { ...m, inStock: !m.inStock } : m)),
    }));
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setState((s) => ({ ...s, menu: s.menu.filter((m) => m.id !== itemId) }));
  }, []);

  const topUpWallet = useCallback((amount: number) => {
    setState((s) => ({ ...s, wallet: s.wallet + amount }));
  }, []);

  const setRiderOnline = useCallback((riderOnline: boolean) => {
    setState((s) => ({ ...s, riderOnline }));
  }, []);

  const setVendorId = useCallback((vendorId: string) => {
    setState((s) => ({ ...s, vendorId }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      role: state.role,
      setRole,
      neighborhood: state.neighborhood,
      setNeighborhood,
      cart: state.cart,
      cartVendor,
      cartCount,
      cartSubtotal,
      addToCart,
      setQty,
      clearCart,
      orders: state.orders,
      placeOrder,
      updateOrderStatus,
      assignRider,
      menu: state.menu,
      vendors: state.vendors,
      upsertItem,
      toggleStock,
      deleteItem,
      wallet: state.wallet,
      topUpWallet,
      riderOnline: state.riderOnline,
      setRiderOnline,
      vendorId: state.vendorId,
      setVendorId,
      activeVendor,
    }),
    [
      ready,
      state,
      cartVendor,
      cartCount,
      cartSubtotal,
      activeVendor,
      setRole,
      setNeighborhood,
      addToCart,
      setQty,
      clearCart,
      placeOrder,
      updateOrderStatus,
      assignRider,
      upsertItem,
      toggleStock,
      deleteItem,
      topUpWallet,
      setRiderOnline,
      setVendorId,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function itemsForVendor(menu: MenuItem[], vendorId: string) {
  return menu.filter((m) => m.vendorId === vendorId);
}

export function vendorsByCategory(vendors: Vendor[], category?: VendorCategory | 'all') {
  if (!category || category === 'all') return vendors;
  return vendors.filter((v) => v.category === category);
}
