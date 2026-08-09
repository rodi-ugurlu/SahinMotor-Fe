import type { Dealer, DealerUser } from '../types/dealers';
import { users } from '../../users/services/usersService';

let dealers: Dealer[] = [
  {
    id: 'd1', name: 'Şahin Motor', description: 'Sıfır Motor Satışı, Bakım ve Onarım Hizmetleri',
    logoUrl: undefined, assignedUserIds: ['u1', 'u2', 'u3'], createdAt: '10.01.2026',
  },
  {
    id: 'd2', name: 'Koman Motor', description: 'Kask, Mont ve Koruma Ekipmanları Satışı',
    logoUrl: undefined, assignedUserIds: ['u4', 'u5'], createdAt: '15.02.2026',
  },
];

export async function getDealers(): Promise<Dealer[]> {
  return new Promise((resolve) => setTimeout(() => resolve([...dealers]), 400));
}

export async function getAvailableUsers(): Promise<DealerUser[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result: DealerUser[] = users.map((u) => ({
        id: u.id,
        name: u.fullName,
        role: u.role,
        email: u.email,
      }));
      resolve(result);
    }, 300);
  });
}

export async function addDealer(data: { name: string; description: string; logoUrl?: string }): Promise<Dealer> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dealer: Dealer = {
        ...data,
        id: `d-${Date.now()}`,
        assignedUserIds: [],
        createdAt: new Date().toLocaleDateString('tr-TR'),
      };
      dealers = [dealer, ...dealers];
      resolve(dealer);
    }, 300);
  });
}

export async function updateDealer(id: string, data: { name: string; description: string; logoUrl?: string }): Promise<Dealer> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = dealers.findIndex((d) => d.id === id);
      if (index === -1) return reject(new Error('Bayi bulunamadı'));
      dealers[index] = { ...dealers[index], ...data };
      resolve(dealers[index]);
    }, 300);
  });
}

export async function deleteDealer(id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      dealers = dealers.filter((d) => d.id !== id);
      resolve();
    }, 300);
  });
}

export async function assignUserToDealer(dealerId: string, userId: string): Promise<Dealer> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = dealers.findIndex((d) => d.id === dealerId);
      if (index === -1) return reject(new Error('Bayi bulunamadı'));
      if (!dealers[index].assignedUserIds.includes(userId)) {
        dealers[index] = {
          ...dealers[index],
          assignedUserIds: [...dealers[index].assignedUserIds, userId],
        };
      }
      resolve(dealers[index]);
    }, 200);
  });
}

export async function removeUserFromDealer(dealerId: string, userId: string): Promise<Dealer> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = dealers.findIndex((d) => d.id === dealerId);
      if (index === -1) return reject(new Error('Bayi bulunamadı'));
      dealers[index] = {
        ...dealers[index],
        assignedUserIds: dealers[index].assignedUserIds.filter((id) => id !== userId),
      };
      resolve(dealers[index]);
    }, 200);
  });
}
