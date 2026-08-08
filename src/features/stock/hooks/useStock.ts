import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import type { Product, StockFilter } from '../types/stock';
import { addProduct, deleteProduct, getProducts, updateProduct } from '../services/stockService';

type State = 'loading' | 'loaded' | 'empty' | 'error';

interface UseStockReturn {
  products: Product[];
  filteredProducts: Product[];
  state: State;
  search: string;
  filter: StockFilter;
  setSearch: (value: string) => void;
  setFilter: (filter: StockFilter) => void;
  handleAdd: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  handleUpdate: (id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  retry: () => void;
}

export function useStock(): UseStockReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<State>('loading');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StockFilter>('all');

  const fetch = useCallback(() => {
    setState('loading');
    getProducts()
      .then((data) => {
        setProducts(data);
        setState(data.length === 0 ? 'empty' : 'loaded');
      })
      .catch(() => setState('error'));
  }, []);

  useEffect(() => {
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
          p.model.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, filter, search]);

  const handleAdd = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProduct = await addProduct(data);
      setProducts((prev) => [newProduct, ...prev]);
      setState('loaded');
      message.success('Ürün başarıyla eklendi');
    } catch {
      message.error('Ürün eklenirken hata oluştu');
    }
  };

  const handleUpdate = async (id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
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

  return {
    products, filteredProducts, state, search, filter,
    setSearch, setFilter, handleAdd, handleUpdate, handleDelete,
    retry: fetch,
  };
}
