export type UserRole = 'sahin' | 'koman' | 'admin' | null;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SahinRegisterRequest {
  firstName: string;
  lastName: string;
  companyName: string;
  city: string;
  district: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export interface KomanRegisterRequest {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export type TicketCategory = 'Motor' | 'Elektrik' | 'Hidrolik' | 'Pnömatik' | 'GenelBakim' | 'ECU';

export type AuthRole = 'sahin' | 'koman';
export type AuthView = 'login' | 'register';
