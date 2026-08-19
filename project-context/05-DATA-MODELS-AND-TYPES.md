# 05 - Data Models & TypeScript Definitions

This document collects all key interfaces, types, and data schemas across the application for fast reference by AI agents.

---

## 1. Authentication & Users

```typescript
// src/features/auth/types/auth.ts
export type UserRole = 'sahin' | 'koman' | 'admin' | null;
export type AuthRole = 'sahin' | 'koman';
export type AuthView = 'login' | 'register';
export type TicketCategory = 'Motor' | 'Elektrik' | 'Hidrolik' | 'Pnömatik' | 'GenelBakim' | 'ECU';

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

// src/features/users/types/users.ts
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
```

---

## 2. Business & Dealers

```typescript
// src/features/business/types/business.ts
export interface Business {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
}

// src/features/dealers/types/dealers.ts
export interface DealerUser {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface Dealer {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  assignedUserIds: string[];
  createdAt: string;
}

export type DealerFormValues = {
  name: string;
  description: string;
  logoUrl?: string;
};
```

---

## 3. Stock & Inventory

```typescript
// src/features/stock/types/stock.ts
export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  model: string;
  size: string;
  color: string;
  purchasePrice: number;
  salePrice: number;
  imageUrl?: string;
  stock: number;
  minStock: number;
  dealerId: string;
  createdAt: string;
  updatedAt: string;
}

export type StockFilter = 'all' | 'critical' | 'normal';

export type ProductFormValues = Omit<Product, 'id' | 'dealerId' | 'createdAt' | 'updatedAt'>;

export interface StockEntryItem {
  productId?: string;
  barcode: string;
  name: string;
  quantity: number;
  isNew: boolean;
  newProductData?: Omit<Product, 'id' | 'dealerId' | 'createdAt' | 'updatedAt' | 'stock'>;
}
```

---

## 4. Sales & POS

```typescript
// src/features/sales/types/sales.ts
export interface SaleItem {
  productId: string;
  productName: string;
  productCode: string;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

export type PaymentMethod = 'kart' | 'nakit' | 'havale';
export type SaleStatus = 'taslak' | 'beklemede' | 'bitti' | 'iptal';

export interface Sale {
  id: string;
  bayiId: string;
  personelId: string;
  musteriId: string;
  musteriAdi: string;
  musteriTelefon: string;
  musteriEmail?: string;
  items: SaleItem[];
  toplamTutar: number;
  odemeYontemi: PaymentMethod;
  durum: SaleStatus;
  faturaDosyasi?: string;
  createdAt: string;
  updatedAt: string;
}

// Satış modülü içinde kullanılan hafif müşteri tipi (sales/types/sales.ts)
export type CustomerType = 'individual' | 'company';

export interface Customer {
  id: string;
  fullName: string;
  type: CustomerType;
  tc?: string;
  vkn?: string;
  taxOffice?: string;
  billingAddress?: string;
  phone: string;
  email?: string;
}
```

---

## 5. Customers CRM

```typescript
// src/features/customers/types/customers.ts
export type CustomerType = 'individual' | 'company';

export interface Customer {
  id: string;
  fullName: string;
  type: CustomerType;
  tc?: string;
  vkn?: string;
  taxOffice?: string;
  billingAddress: string;
  phone: string;
  email: string;
  createdAt: string;
}

export type CustomerFormValues = Omit<Customer, 'id' | 'createdAt'>;
```

---

## 6. Audit Logs

```typescript
// src/features/logs/types/logs.ts
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
```

---

## 7. Reports & Analytics

```typescript
// src/features/reports/types/reports.ts
export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface DailyReport {
  date: string;
  invoiceNo: string;
  customer: string;
  itemCount: number;
  total: number;
}

export interface WeeklyReport {
  week: string;
  totalSales: number;
  totalRevenue: number;
  avgRevenue: number;
}

export interface MonthlyReport {
  month: string;
  totalSales: number;
  totalRevenue: number;
  avgRevenue: number;
  growth: number;
}

export interface ProductReport {
  rank: number;
  productName: string;
  category: string;
  salesCount: number;
  totalRevenue: number;
  revenuePercent: number;
}

export interface ReportSummary {
  revenue: number;
  revenueChange: number;
  salesCount: number;
  salesChange: number;
  avgBasket: number;
  topItem: string;
}
```
