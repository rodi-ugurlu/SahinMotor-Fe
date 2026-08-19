import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import { useParams } from 'react-router-dom';
import type { Product, ProductFormValues, StockEntryItem, StockFilter, WasteEntryItem } from '../types/stock';
import { addProduct, applyStockEntries, applyWasteEntries, deleteProduct, getProducts, updateProduct } from '../services/stockService';

type State = 'loading' | 'loaded' | 'empty' | 'error';

interface UseStockReturn {
  products: Product[];
  filteredProducts: Product[];
  state: State;
  search: string;
  filter: StockFilter;
  setSearch: (value: string) => void;
  setFilter: (filter: StockFilter) => void;
  handleAdd: (data: ProductFormValues) => Promise<void>;
  handleUpdate: (id: string, data: Partial<ProductFormValues>) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleStockEntries: (entries: StockEntryItem[]) => Promise<void>;
  handleWasteEntries: (entries: WasteEntryItem[]) => Promise<void>;
  retry: () => void;
}

export function useStock(): UseStockReturn {
  const { businessId = 'd1' } = useParams<{ businessId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<State>('loading');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StockFilter>('all');

  const fetch = useCallback(() => {
    setState('loading');
    getProducts()
      .then((data) => {
        const businessProducts = data.filter((product) => product.dealerId === businessId);
        setProducts(businessProducts);
        setState(businessProducts.length === 0 ? 'empty' : 'loaded');
      })
      .catch(() => setState('error'));
  }, [businessId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- route change starts a new stock load
    fetch();
  }, [fetch]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (filter === 'critical') {
      result = result.filter((p) => p.stock <= p.minStock);
    } else if (filter === 'normal') {
      result = result.filter((p) => p.stock > p.minStock);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.barcode.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, filter, search]);

  const handleAdd = async (data: ProductFormValues) => {
    try {
      const newProduct = await addProduct({ ...data, dealerId: businessId });
      setProducts((prev) => [newProduct, ...prev]);
      setState('loaded');
      message.success('Ürün başarıyla eklendi');
    } catch {
      message.error('Ürün eklenirken hata oluştu');
    }
  };

  const handleUpdate = async (id: string, data: Partial<ProductFormValues>) => {
    try {
      const updated = await updateProduct(id, data);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      message.success('Ürün güncellendi');
    } catch {
      message.error('Ürün güncellenirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => {
        const next = prev.filter((p) => p.id !== id);
        if (next.length === 0) setState('empty');
        return next;
      });
      message.success('Ürün silindi');
    } catch {
      message.error('Ürün silinirken hata oluştu');
    }
  };

  const handleStockEntries = async (entries: StockEntryItem[]) => {
    try {
      const updated = await applyStockEntries(entries, businessId);
      setProducts((prev) => {
        const updatedIds = new Set(updated.map((p) => p.id));
        const merged = [...updated, ...prev.filter((p) => !updatedIds.has(p.id))];
        return merged;
      });
      setState('loaded');
      const totalQty = entries.reduce((sum, e) => sum + e.quantity, 0);
      message.success(`${entries.length} ürüne toplam ${totalQty} adet stok girişi yapıldı`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Stok girişi yapılırken hata oluştu';
      message.error(msg);
      throw err;
    }
  };

  const handleWasteEntries = async (entries: WasteEntryItem[]) => {
    try {
      const updated = await applyWasteEntries(entries, businessId);
      setProducts((previousProducts) => {
        const updatedById = new Map(updated.map((product) => [product.id, product]));
        return previousProducts.map((product) => updatedById.get(product.id) ?? product);
      });
      const totalQuantity = entries.reduce((total, entry) => total + entry.quantity, 0);
      message.success(`${entries.length} üründen toplam ${totalQuantity} adet stoktan düşüldü`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Atık ürünler stoktan düşülürken hata oluştu';
      message.error(errorMessage);
      throw error;
    }
  };

  return {
    products, filteredProducts, state, search, filter,
    setSearch, setFilter,
    handleAdd, handleUpdate, handleDelete, handleStockEntries, handleWasteEntries,
    retry: fetch,
  };
}
