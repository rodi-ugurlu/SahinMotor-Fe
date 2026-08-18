import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import { useParams } from 'react-router-dom';
import type { Product, ProductFormValues, StockEntryItem, StockFilter } from '../types/stock';
import { addProduct, applyStockEntries, deleteProduct, getProducts, updateProduct } from '../services/stockService';

type State = 'loading' | 'loaded' | 'empty' | 'error';

interface UseStockReturn {
  products: Product[];
  filteredProducts: Product[];
  state: State;
  search: string;
  filter: StockFilter;
  brandFilter: string;
  modelFilter: string;
  sizeFilter: string;
  colorFilter: string;
  setSearch: (value: string) => void;
  setFilter: (filter: StockFilter) => void;
  setBrandFilter: (brand: string) => void;
  setModelFilter: (model: string) => void;
  setSizeFilter: (size: string) => void;
  setColorFilter: (color: string) => void;
  handleAdd: (data: ProductFormValues) => Promise<void>;
  handleUpdate: (id: string, data: Partial<ProductFormValues>) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleStockEntries: (entries: StockEntryItem[]) => Promise<void>;
  retry: () => void;
}

export function useStock(): UseStockReturn {
  const { businessId = 'd1' } = useParams<{ businessId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<State>('loading');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StockFilter>('all');
  const [brandFilter, setBrandFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');

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

    if (brandFilter) {
      result = result.filter((p) => p.brand === brandFilter);
    }

    if (modelFilter) {
      result = result.filter((p) => p.model === modelFilter);
    }

    if (sizeFilter) {
      result = result.filter((p) => p.size === sizeFilter);
    }

    if (colorFilter) {
      result = result.filter((p) => p.color === colorFilter);
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
  }, [products, filter, brandFilter, modelFilter, sizeFilter, colorFilter, search]);

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

  return {
    products, filteredProducts, state, search, filter,
    brandFilter, modelFilter, sizeFilter, colorFilter,
    setSearch, setFilter, setBrandFilter, setModelFilter, setSizeFilter, setColorFilter,
    handleAdd, handleUpdate, handleDelete, handleStockEntries,
    retry: fetch,
  };
}
