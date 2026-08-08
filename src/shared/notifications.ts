import { useSyncExternalStore } from 'react';

export interface Notification {
  id: string;
  message: string;
  time: string;
  type: 'sales' | 'stock' | 'login' | 'logout';
}

let notifications: Notification[] = [];
let listeners: (() => void)[] = [];

function emitChange() {
  listeners.forEach((l) => l());
}

export function addNotification(n: Omit<Notification, 'id' | 'time'>) {
  const notif: Notification = {
    ...n,
    id: String(Date.now()),
    time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  };
  notifications = [notif, ...notifications].slice(0, 20);
  emitChange();
}

export function clearNotifications() {
  notifications = [];
  emitChange();
}

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function getSnapshot() {
  return notifications;
}

export function useNotifications() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
