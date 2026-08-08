import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import type { Customer, Sale, SaleItem, PaymentMethod } from '../types/sales';
import { createSale, deleteSale, getCustomers, getProducts, getSales, updateSaleStatus } from '../services/salesService';

type State = 'loading' | 'loaded' | 'empty' | 'error';

interface UseSalesReturn {
  sales: Sale[];
  filteredSales: Sale[];
  state: State;
  search: string;
  statusFilter: Sale['durum'] | 'all';
  customers: Customer[];
  products: Array<{ id: string; name: string; code: string; price: number }>;
  cartItems: SaleItem[];
  showSalesList: boolean;
  setSearch: (s: string) => void;
  setStatusFilter: (f: Sale['durum'] | 'all') => void;
  setShowSalesList: (v: boolean) => void;
  setCartItems: (items: SaleItem[]) => void;
  addToCart: (productId: string) => void;
  updateCartItem: (index: number, updates: Partial<SaleItem>) => void;
  removeCartItem: (index: number) => void;
  handleCreateSale: (data: {
    bayiId: string; personelId: string; musteriId: string;
    musteriAdi: string; musteriTelefon: string; musteriEmail?: string;
    odemeYontemi: PaymentMethod; durum: Sale['durum'];
  }) => Promise<Sale | undefined>;
  handleUpdateStatus: (id: string, durum: Sale['durum']) => Promise<void>;
  handleDeleteSale: (id: string) => Promise<void>;
  retry: () => void;
}

export function useSales(): UseSalesReturn {
  const [sales, setSales] = useState<Sale[]>([]);
  const [state, setState] = useState<State>('loading');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Sale['durum'] | 'all'>('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; code: string; price: number }>>([]);
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [showSalesList, setShowSalesList] = useState(false);

  const fetch = useCallback(() => {
    setState('loading');
    Promise.all([getSales(), getCustomers(), getProducts()])
      .then(([s, c, p]) => {
        setSales(s);
        setCustomers(c);
        setProducts(p);
        setState(s.length === 0 ? 'empty' : 'loaded');
      })
      .catch(() => setState('error'));
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filteredSales = useMemo(() => {
    let result = sales;
    if (statusFilter !== 'all') result = result.filter((s) => s.durum === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.musteriAdi.toLowerCase().includes(q) ||
          s.musteriTelefon.includes(q)
      );
    }
    return result;
  }, [sales, search, statusFilter]);

  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCartItems((prev) => {
      const existing = prev.findIndex((i) => i.productId === productId);
      if (existing >= 0) {
        const updated = [...prev];
        const newQty = updated[existing].quantity + 1;
        const discountAmount = (updated[existing].unitPrice * newQty * updated[existing].discountPercent) / 100;
        updated[existing] = {
          ...updated[existing],
          quantity: newQty,
          discountAmount,
          total: updated[existing].unitPrice * newQty - discountAmount,
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id, productName: product.name, productCode: product.code,
          unitPrice: product.price, quantity: 1, discountPercent: 0, discountAmount: 0, total: product.price,
        },
      ];
    });
  };

  const updateCartItem = (index: number, updates: Partial<SaleItem>) => {
    setCartItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], ...updates };
      const discountAmount = updates.discountPercent !== undefined
        ? (item.unitPrice * item.quantity * item.discountPercent) / 100
        : item.discountAmount;
      item.discountAmount = discountAmount;
      item.total = item.unitPrice * item.quantity - discountAmount;
      updated[index] = item;
      return updated;
    });
  };

  const removeCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateSale = async (data: {
    bayiId: string; personelId: string; musteriId: string;
    musteriAdi: string; musteriTelefon: string; musteriEmail?: string;
    odemeYontemi: PaymentMethod; durum: Sale['durum'];
  }): Promise<Sale | undefined> => {
    if (cartItems.length === 0) {
      message.warning('Sepete en az bir ürün ekleyin');
      return;
    }
    try {
      const newSale = await createSale({ ...data, items: cartItems });
      setSales((prev) => [newSale, ...prev]);
      setState('loaded');
      setCartItems([]);
      return newSale;
    } catch {
      message.error('Satış oluşturulurken hata oluştu');
    }
  };

  const handleUpdateStatus = async (id: string, durum: Sale['durum']) => {
    try {
      const updated = await updateSaleStatus(id, durum);
      setSales((prev) => prev.map((s) => (s.id === id ? updated : s)));
      message.success('Durum güncellendi');
    } catch {
      message.error('Durum güncellenirken hata oluştu');
    }
  };

  const handleDeleteSale = async (id: string) => {
    try {
      await deleteSale(id);
      setSales((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (next.length === 0) setState('empty');
        return next;
      });
      message.success('Satış silindi');
    } catch {
      message.error('Satış silinirken hata oluştu');
    }
  };

  return {
    sales, filteredSales, state, search, statusFilter,
    customers, products, cartItems, showSalesList,
    setSearch, setStatusFilter, setShowSalesList, setCartItems,
    addToCart, updateCartItem, removeCartItem,
    handleCreateSale, handleUpdateStatus, handleDeleteSale,
    retry: fetch,
  };
}
