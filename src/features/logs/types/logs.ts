export type LogType = 'sales' | 'stock' | 'login' | 'logout';
export type LogModule = 'Satış' | 'Stok Yönetimi' | 'Auth';

export interface LogUser {
  id: string;
  name: string;
  role: 'SuperAdmin' | 'Admin' | 'Personel' | 'Guest';
  color: string;
}

export interface LogChange {
  field: string;
  oldValue: string;
  newValue: string;
}

export interface LogEntry {
  id: string;
  date: string;
  user: LogUser;
  type: LogType;
  module: LogModule;
  description: string;
  detail?: string;
  ip: string;
  changes?: LogChange[];
}

export const USERS: LogUser[] = [
  { id: 'u1', name: 'Zeynel', role: 'SuperAdmin', color: '#E32727' },
  { id: 'u2', name: 'Ayşe', role: 'Admin', color: '#3B82F6' },
  { id: 'u3', name: 'Abdullah', role: 'Personel', color: '#22C55E' },
  { id: 'u4', name: 'Maliyeci', role: 'Guest', color: '#94A3B8' },
];
