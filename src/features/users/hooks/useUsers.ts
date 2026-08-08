import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import type { User, UserRole } from '../types/users';
import {
  addUser, deleteUser, getUsers, resetUserPassword, updateUser,
} from '../services/usersService';

type State = 'loading' | 'loaded' | 'empty' | 'error';

interface UseUsersReturn {
  users: User[];
  filteredUsers: User[];
  state: State;
  search: string;
  roleFilter: UserRole | 'all';
  setSearch: (v: string) => void;
  setRoleFilter: (v: UserRole | 'all') => void;
  handleAdd: (data: {
    fullName: string; email: string; password: string;
    photoUrl?: string; role: UserRole; dealerId: string;
  }) => Promise<void>;
  handleUpdate: (id: string, data: {
    fullName: string; email: string; photoUrl?: string; role: UserRole; dealerId: string;
  }) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleResetPassword: (id: string, newPassword: string) => Promise<void>;
  retry: () => void;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [state, setState] = useState<State>('loading');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const fetch = useCallback(() => {
    setState('loading');
    getUsers()
      .then((data) => {
        setUsers(data);
        setState(data.length === 0 ? 'empty' : 'loaded');
      })
      .catch(() => setState('error'));
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filteredUsers = useMemo(() => {
    let result = users;
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [users, search, roleFilter]);

  const handleAdd = async (data: {
    fullName: string; email: string; password: string;
    photoUrl?: string; role: UserRole; dealerId: string;
  }) => {
    try {
      const newUser = await addUser(data);
      setUsers((prev) => [newUser, ...prev]);
      setState('loaded');
      message.success('Kullanıcı başarıyla eklendi');
    } catch {
      message.error('Kullanıcı eklenirken hata oluştu');
    }
  };

  const handleUpdate = async (id: string, data: {
    fullName: string; email: string; photoUrl?: string; role: UserRole; dealerId: string;
  }) => {
    try {
      const updated = await updateUser(id, data);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      message.success('Kullanıcı güncellendi');
    } catch {
      message.error('Kullanıcı güncellenirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers((prev) => {
        const next = prev.filter((u) => u.id !== id);
        if (next.length === 0) setState('empty');
        return next;
      });
      message.success('Kullanıcı silindi');
    } catch {
      message.error('Kullanıcı silinirken hata oluştu');
    }
  };

  const handleResetPassword = async (id: string, newPassword: string) => {
    try {
      const updated = await resetUserPassword(id, newPassword);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      message.success('Şifre başarıyla sıfırlandı');
    } catch {
      message.error('Şifre sıfırlanırken hata oluştu');
    }
  };

  return {
    users, filteredUsers, state, search, roleFilter,
    setSearch, setRoleFilter,
    handleAdd, handleUpdate, handleDelete, handleResetPassword,
    retry: fetch,
  };
}
