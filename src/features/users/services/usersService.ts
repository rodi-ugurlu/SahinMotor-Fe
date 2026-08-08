import type { User, UserRole } from '../types/users';

export let users: User[] = [
  {
    id: 'u1', fullName: 'Zeynel Şahin', email: 'zeynel@sahinmotor.com',
    password: 'Admin123!', role: 'SuperAdmin', dealerId: 'd1', createdAt: '10.01.2026',
  },
  {
    id: 'u2', fullName: 'Ayşe Yılmaz', email: 'ayse@sahinmotor.com',
    password: 'Admin123!', role: 'Admin', dealerId: 'd1', createdAt: '12.01.2026',
  },
  {
    id: 'u3', fullName: 'Abdullah Kaya', email: 'abdullah@sahinmotor.com',
    password: 'Personel123!', role: 'Personel', dealerId: 'd1', createdAt: '15.01.2026',
  },
  {
    id: 'u4', fullName: 'Maliyeci Demir', email: 'maliyeci@sahinmotor.com',
    password: 'Guest123!', role: 'Guest', dealerId: 'd2', createdAt: '20.02.2026',
  },
  {
    id: 'u5', fullName: 'Emre Öztürk', email: 'emre@sahinmotor.com',
    password: 'Personel123!', role: 'Personel', dealerId: 'd2', createdAt: '01.03.2026',
  },
  {
    id: 'u6', fullName: 'Fatma Çelik', email: 'fatma@sahinmotor.com',
    password: 'Admin123!', role: 'Admin', dealerId: 'd3', createdAt: '05.06.2026',
  },
  {
    id: 'u7', fullName: 'Kemal Aydın', email: 'kemal@sahinmotor.com',
    password: 'Personel123!', role: 'Personel', dealerId: 'd3', createdAt: '10.06.2026',
  },
  {
    id: 'u8', fullName: 'Selin Koç', email: 'selin@sahinmotor.com',
    password: 'Personel123!', role: 'Personel', dealerId: 'd3', createdAt: '15.06.2026',
  },
];

export async function getUsers(): Promise<User[]> {
  return new Promise((resolve) => setTimeout(() => resolve([...users]), 400));
}

export async function addUser(data: {
  fullName: string; email: string; password: string;
  photoUrl?: string; role: UserRole; dealerId: string;
}): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user: User = {
        ...data,
        id: `u-${Date.now()}`,
        createdAt: new Date().toLocaleDateString('tr-TR'),
      };
      users = [user, ...users];
      resolve(user);
    }, 300);
  });
}

export async function updateUser(id: string, data: {
  fullName: string; email: string; photoUrl?: string; role: UserRole; dealerId: string;
}): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) return reject(new Error('Kullanıcı bulunamadı'));
      users[index] = { ...users[index], ...data };
      resolve(users[index]);
    }, 300);
  });
}

export async function deleteUser(id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      users = users.filter((u) => u.id !== id);
      resolve();
    }, 300);
  });
}

export async function resetUserPassword(id: string, newPassword: string): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) return reject(new Error('Kullanıcı bulunamadı'));
      users[index] = { ...users[index], password: newPassword };
      resolve(users[index]);
    }, 300);
  });
}
