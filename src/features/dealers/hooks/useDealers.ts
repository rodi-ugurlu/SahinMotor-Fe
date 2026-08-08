import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import type { Dealer, DealerUser } from '../types/dealers';
import {
  addDealer, assignUserToDealer, deleteDealer,
  getAvailableUsers, getDealers, removeUserFromDealer, updateDealer,
} from '../services/dealersService';

type State = 'loading' | 'loaded' | 'empty' | 'error';

interface UseDealersReturn {
  dealers: Dealer[];
  filteredDealers: Dealer[];
  availableUsers: DealerUser[];
  state: State;
  search: string;
  setSearch: (v: string) => void;
  handleAdd: (data: { name: string; description: string; logoUrl?: string }) => Promise<void>;
  handleUpdate: (id: string, data: { name: string; description: string; logoUrl?: string }) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleAssignUser: (dealerId: string, userId: string) => Promise<void>;
  handleRemoveUser: (dealerId: string, userId: string) => Promise<void>;
  retry: () => void;
}

export function useDealers(): UseDealersReturn {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [availableUsers, setAvailableUsers] = useState<DealerUser[]>([]);
  const [state, setState] = useState<State>('loading');
  const [search, setSearch] = useState('');

  const fetch = useCallback(() => {
    setState('loading');
    Promise.all([getDealers(), getAvailableUsers()])
      .then(([d, u]) => {
        setDealers(d);
        setAvailableUsers(u);
        setState(d.length === 0 ? 'empty' : 'loaded');
      })
      .catch(() => setState('error'));
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filteredDealers = useMemo(() => {
    if (!search.trim()) return dealers;
    const q = search.toLowerCase();
    return dealers.filter((d) => d.name.toLowerCase().includes(q));
  }, [dealers, search]);

  const handleAdd = async (data: { name: string; description: string; logoUrl?: string }) => {
    try {
      const d = await addDealer(data);
      setDealers((prev) => [d, ...prev]);
      setState('loaded');
      message.success('Bayi başarıyla eklendi');
    } catch {
      message.error('Bayi eklenirken hata oluştu');
    }
  };

  const handleUpdate = async (id: string, data: { name: string; description: string; logoUrl?: string }) => {
    try {
      const updated = await updateDealer(id, data);
      setDealers((prev) => prev.map((d) => (d.id === id ? updated : d)));
      message.success('Bayi güncellendi');
    } catch {
      message.error('Bayi güncellenirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDealer(id);
      setDealers((prev) => {
        const next = prev.filter((d) => d.id !== id);
        if (next.length === 0) setState('empty');
        return next;
      });
      message.success('Bayi silindi');
    } catch {
      message.error('Bayi silinirken hata oluştu');
    }
  };

  const handleAssignUser = async (dealerId: string, userId: string) => {
    try {
      const updated = await assignUserToDealer(dealerId, userId);
      setDealers((prev) => prev.map((d) => (d.id === dealerId ? updated : d)));
      message.success('Kullanıcı bayiye atandı');
    } catch {
      message.error('Kullanıcı atanırken hata oluştu');
    }
  };

  const handleRemoveUser = async (dealerId: string, userId: string) => {
    try {
      const updated = await removeUserFromDealer(dealerId, userId);
      setDealers((prev) => prev.map((d) => (d.id === dealerId ? updated : d)));
      message.success('Kullanıcı bayiden çıkarıldı');
    } catch {
      message.error('Kullanıcı çıkarılırken hata oluştu');
    }
  };

  return {
    dealers, filteredDealers, availableUsers, state, search,
    setSearch, handleAdd, handleUpdate, handleDelete,
    handleAssignUser, handleRemoveUser, retry: fetch,
  };
}
