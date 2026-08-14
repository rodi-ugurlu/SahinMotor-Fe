import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import type { Customer, CustomerFormValues, CustomerType } from '../types/customers';
import { addCustomer, deleteCustomer, getCustomers, updateCustomer } from '../services/customersService';

type State = 'loading' | 'loaded' | 'empty' | 'error';

interface UseCustomersReturn {
  customers: Customer[];
  filteredCustomers: Customer[];
  state: State;
  search: string;
  typeFilter: CustomerType | 'all';
  setSearch: (value: string) => void;
  setTypeFilter: (value: CustomerType | 'all') => void;
  handleAdd: (data: CustomerFormValues) => Promise<void>;
  handleUpdate: (id: string, data: Partial<CustomerFormValues>) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  retry: () => void;
}

export function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [state, setState] = useState<State>('loading');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CustomerType | 'all'>('all');

  const fetch = useCallback(() => {
    setState('loading');
    getCustomers()
      .then((data) => {
        setCustomers(data);
        setState(data.length === 0 ? 'empty' : 'loaded');
      })
      .catch(() => setState('error'));
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filteredCustomers = useMemo(() => {
    let result = customers;
    if (typeFilter !== 'all') {
      result = result.filter((c) => c.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.tc && c.tc.includes(q)) ||
          (c.vkn && c.vkn.includes(q)) ||
          (c.taxOffice && c.taxOffice.toLowerCase().includes(q))
      );
    }
    return result;
  }, [customers, search, typeFilter]);

  const handleAdd = async (data: CustomerFormValues) => {
    try {
      const newCustomer = await addCustomer(data);
      setCustomers((prev) => [newCustomer, ...prev]);
      setState('loaded');
      message.success('Müşteri başarıyla eklendi');
    } catch {
      message.error('Müşteri eklenirken hata oluştu');
    }
  };

  const handleUpdate = async (id: string, data: Partial<CustomerFormValues>) => {
    try {
      const updated = await updateCustomer(id, data);
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
      message.success('Müşteri güncellendi');
    } catch {
      message.error('Müşteri güncellenirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      setCustomers((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length === 0) setState('empty');
        return next;
      });
      message.success('Müşteri silindi');
    } catch {
      message.error('Müşteri silinirken hata oluştu');
    }
  };

  return {
    customers,
    filteredCustomers,
    state,
    search,
    typeFilter,
    setSearch,
    setTypeFilter,
    handleAdd,
    handleUpdate,
    handleDelete,
    retry: fetch,
  };
}
