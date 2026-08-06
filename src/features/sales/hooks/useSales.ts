import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import type { Customer, Sale, SaleItem, SalesFilter, SalesView, SaleStep } from '../types/sales';
import { createSale, deleteSale, getCustomers, getProducts, getSales, convertToInvoice } from '../services/salesService';

interface UseSalesReturn {
  sales: Sale[];
  filteredSales: Sale[];
  state: 'loading' | 'loaded' | 'empty' | 'error';
  view: SalesView;
  step: SaleStep;
  filter: SalesFilter;
  search: string;
  customers: Customer[];
  products: Array<{ id: string; name: string; code: string; price: number }>;
  selectedCustomer: Customer | null;
  cartItems: SaleItem[];
  setView: (v: SalesView) => void;
  setStep: (s: SaleStep) => void;
  setFilter: (f: SalesFilter) => void;
  setSearch: (s: string) => void;
  setSelectedCustomer: (c: Customer | null) => void;
  setCartItems: (items: SaleItem[]) => void;
  addToCart: (productId: string) => void;
  updateCartItem: (index: number, updates: Partial<SaleItem>) => void;
  removeCartItem: (index: number) => void;
  handleCreateSale: (type: 'proforma' | 'invoice') => Promise<void>;
  handleConvertToInvoice: (saleId: string) => Promise<void>;
  handleDeleteSale: (saleId: string) => Promise<void>;
  retry: () => void;
}

export function useSales(): UseSalesReturn {
  const [sales, setSales] = useState<Sale[]>([]);
  const [state, setState] = useState<'loading' | 'loaded' | 'empty' | 'error'>('loading');
  const [view, setView] = useState<SalesView>('list');
  const [step, setStep] = useState<SaleStep>(1);
  const [filter, setFilter] = useState<SalesFilter>('all');
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; code: string; price: number }>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
  }, [fetch]);

  const filteredSales = useMemo(() => {
    let result = sales;
    if (filter === 'proforma') result = result.filter((s) => s.type === 'proforma');
    if (filter === 'invoice') result = result.filter((s) => s.type === 'invoice');
    if (filter === 'pending') result = result.filter((s) => s.status === 'pending');
    if (filter === 'completed') result = result.filter((s) => s.status === 'completed');
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.invoiceNo.toLowerCase().includes(q) ||
          s.customer.name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [sales, filter, search]);

  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const existing = cartItems.findIndex((i) => i.productId === productId);
    if (existing >= 0) {
      const updated = [...cartItems];
      updated[existing] = {
        ...updated[existing],
        quantity: updated[existing].quantity + 1,
        total: (updated[existing].quantity + 1) * updated[existing].unitPrice - updated[existing].discountAmount,
      };
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          unitPrice: product.price,
          quantity: 1,
          discountPercent: 0,
          discountAmount: 0,
          total: product.price,
        },
      ]);
    }
  };

  const updateCartItem = (index: number, updates: Partial<SaleItem>) => {
    const updated = [...cartItems];
    const item = { ...updated[index], ...updates };
    const discountAmount = updates.discountPercent !== undefined
      ? (item.unitPrice * item.quantity * item.discountPercent) / 100
      : item.discountAmount;
    item.discountAmount = discountAmount;
    item.total = item.unitPrice * item.quantity - discountAmount;
    updated[index] = item;
    setCartItems(updated);
  };

  const removeCartItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleCreateSale = async (type: 'proforma' | 'invoice') => {
    if (!selectedCustomer) return;
    if (cartItems.length === 0) return;
    const newSale = await createSale({ customer: selectedCustomer, items: cartItems, type });
    setSales((prev) => [newSale, ...prev]);
    setState('loaded');
    setCartItems([]);
    setSelectedCustomer(null);
    setStep(1);
    setView('list');
    message.success(type === 'invoice' ? 'Fatura oluşturuldu' : 'Proforma kaydedildi');
  };

  const handleConvertToInvoice = async (saleId: string) => {
    const updated = await convertToInvoice(saleId);
    setSales((prev) => prev.map((s) => (s.id === saleId ? updated : s)));
    message.success('Faturaya çevrildi');
  };

  const handleDeleteSale = async (saleId: string) => {
    await deleteSale(saleId);
    setSales((prev) => {
      const next = prev.filter((s) => s.id !== saleId);
      if (next.length === 0) setState('empty');
      return next;
    });
    message.success('Satış silindi');
  };

  return {
    sales, filteredSales, state, view, step, filter, search,
    customers, products, selectedCustomer, cartItems,
    setView, setStep, setFilter, setSearch, setSelectedCustomer, setCartItems,
    addToCart, updateCartItem, removeCartItem,
    handleCreateSale, handleConvertToInvoice, handleDeleteSale,
    retry: fetch,
  };
}
