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
  criticalCount: number;
  totalValue: number;
  setSearch: (value: string) => void;
  setFilter: (filter: StockFilter) => void;
  handleAdd: (data: Omit<Product, 'id' | 'priceUSD'>) => Promise<void>;
  handleUpdate: (id: string, data: Partial<Omit<Product, 'id' | 'priceUSD'>>) => Promise<void>;
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

  const criticalCount = useMemo(
    () => products.filter((p) => p.stock <= p.minStock).length,
    [products]
  );

  const totalValue = useMemo(
    () => products.reduce((sum, p) => sum + p.stock * p.priceTL, 0),
    [products]
  );

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
          p.code.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, filter, search]);

  const handleAdd = async (data: Omit<Product, 'id' | 'priceUSD'>) => {
    const newProduct = await addProduct(data);
    setProducts((prev) => [newProduct, ...prev]);
    setState('loaded');
    message.success('Ürün başarıyla eklendi');
  };

  const handleUpdate = async (id: string, data: Partial<Omit<Product, 'id' | 'priceUSD'>>) => {
    const updated = await updateProduct(id, data);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    message.success('Ürün güncellendi');
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (next.length === 0) setState('empty');
      return next;
    });
    message.success('Ürün silindi');
  };

  return {
    products,
    filteredProducts,
    state,
    search,
    filter,
    criticalCount,
    totalValue,
    setSearch,
    setFilter,
    handleAdd,
    handleUpdate,
    handleDelete,
    retry: fetch,
  };
}
