export type UserRole = 'SuperAdmin' | 'Admin' | 'Personel' | 'Guest';

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  photoUrl?: string;
  role: UserRole;
  dealerId: string;
  createdAt: string;
}

export type UserFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  photoUrl?: string;
  role: UserRole;
  dealerId: string;
};

export type UserEditFormValues = {
  fullName: string;
  email: string;
  photoUrl?: string;
  role: UserRole;
  dealerId: string;
};

export const USER_ROLES: UserRole[] = ['Admin', 'Personel', 'Guest'];


export const ROLE_LABELS: Record<UserRole, string> = {
  SuperAdmin: 'Süper Admin',
  Admin: 'Admin',
  Personel: 'Personel',
  Guest: 'Misafir',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  SuperAdmin: '#E32727',
  Admin: '#3B82F6',
  Personel: '#22C55E',
  Guest: '#94A3B8',
};
