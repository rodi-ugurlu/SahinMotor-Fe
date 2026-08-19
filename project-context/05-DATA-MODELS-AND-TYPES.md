# 05 — Veri Modelleri ve Tipler

Bu belge `src/features/*/types` dosyalarındaki canlı sözleşmeleri özetler. Aynı isimli tiplerin farklı feature'larda ayrı tanımlanabildiğine dikkat edilmelidir.

## Auth

```ts
type UserRole = 'sahin' | 'koman' | 'admin' | null;
type AuthRole = 'sahin' | 'koman';
type AuthView = 'login' | 'register';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface LoginCredentials {
  email: string;
  password: string;
}
```

`SahinRegisterRequest`: firstName, lastName, companyName, city, district, email, phone, password, confirmPassword, terms.

`KomanRegisterRequest`: companyName, contactName, email, phone, city, district, password, confirmPassword, terms.

`TicketCategory`: `'Motor' | 'Elektrik' | 'Hidrolik' | 'Pnömatik' | 'GenelBakim' | 'ECU'`.

## Business

```ts
interface Business {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
}
```

`Business`, `Dealer` kaydından seçim ekranı için map edilir; ayrı bir kalıcı koleksiyon değildir.

## Stock

```ts
interface Product {
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

type StockFilter = 'all' | 'critical' | 'normal';
type ProductFormValues = Omit<Product, 'id' | 'dealerId' | 'createdAt' | 'updatedAt'>;

interface StockEntryItem {
  productId?: string;
  barcode: string;
  name: string;
  quantity: number;
  isNew: boolean;
  newProductData?: Omit<
    Product,
    'id' | 'dealerId' | 'createdAt' | 'updatedAt' | 'stock'
  >;
}

type WasteReason = 'expired' | 'damaged' | 'spilled' | 'unusable' | 'other';

interface WasteEntryItem {
  productId: string;
  barcode: string;
  name: string;
  quantity: number;
  reason?: WasteReason;
}

interface WasteRecord extends WasteEntryItem {
  id: string;
  dealerId: string;
  reason: WasteReason;
  createdAt: string;
}
```

Kurallar:

- `dealerId`, route'taki `businessId` ile atanır/filtrelenir.
- Kritik stok koşulu `stock <= minStock`tir.
- Normal ürün formunda `stock` bulunur; Mal Kabul yeni ürün formunda bu alan gizlenir ve `StockEntryItem.quantity` başlangıç stoğu olur.
- Barkod servis sınırında yeni ürün için 6–32 rakamdır.
- Mal Kabul miktarı pozitif `Number.isSafeInteger` olmalıdır.
- Atık miktarı pozitif `Number.isSafeInteger` olmalı, mevcut stoğu aşmamalı ve neden alanı tanımlı seçeneklerden biri olmalıdır.
- Atık uygulaması ürün stokları ile `WasteRecord` listesini bütün satırlar doğrulandıktan sonra birlikte commit eder.

## Sales

```ts
interface SaleItem {
  productId: string;
  productName: string;
  productCode: string;       // UI'da barkod anlamında kullanılıyor
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

type PaymentMethod = 'kart' | 'nakit' | 'havale';
type SaleStatus = 'taslak' | 'beklemede' | 'bitti' | 'iptal';

interface Sale {
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
```

Sales feature ayrıca kendi `Customer` tipini tanımlar: `id`, `fullName`, `type`, opsiyonel TC/VKN/vergi dairesi/fatura adresi, telefon ve opsiyonel e-posta. Bu tip ve veri seti customers feature'ından bağımsızdır.

## Customers

```ts
type CustomerType = 'individual' | 'company';

interface Customer {
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

type CustomerFormValues = Omit<Customer, 'id' | 'createdAt'>;
```

Sales `Customer` tipinden farklı olarak `billingAddress` ve `email` burada zorunlu string alanlarıdır (UI e-postayı opsiyonel bırakabildiği için boş string olabilir).

## Dealers

```ts
interface DealerUser {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface Dealer {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  assignedUserIds: string[];
  createdAt: string;
}

type DealerFormValues = {
  name: string;
  description: string;
  logoUrl?: string;
};
```

`assignedUserIds`, users servisindeki kimliklere referans verir; foreign-key doğrulaması yalnızca atama servisinin kullanıcıyı bulması düzeyindedir.

## Users

```ts
type UserRole = 'SuperAdmin' | 'Admin' | 'Personel' | 'Guest';

interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  photoUrl?: string;
  role: UserRole;
  dealerId: string;
  createdAt: string;
}
```

`UserFormValues`, `confirmPassword` dahil oluşturma formudur. `UserEditFormValues` parola alanlarını çıkarır. `USER_ROLES` yalnızca `Admin`, `Personel`, `Guest` içerir; `SuperAdmin` type/label/color sözlüğünde vardır fakat yönetim formu seçeneği değildir.

Auth `User` ve users feature `User` aynı model değildir.

## Logs

```ts
type LogType = 'sales' | 'stock' | 'login' | 'logout';
type LogModule = 'Satış' | 'Stok Yönetimi' | 'Auth';

interface LogUser {
  id: string;
  name: string;
  role: 'SuperAdmin' | 'Admin' | 'Personel' | 'Guest';
  color: string;
}

interface LogChange {
  field: string;
  oldValue: string;
  newValue: string;
}

interface LogEntry {
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

`USERS` sabiti 4 log kullanıcısı içerir ve gerçek users service koleksiyonuna bağlı değildir.

## Reports

```ts
type ReportPeriod = 'daily' | 'weekly' | 'monthly';

interface DailyReport {
  date: string;
  invoiceNo: string;
  customer: string;
  itemCount: number;
  total: number;
}

interface WeeklyReport {
  week: string;
  totalSales: number;
  totalRevenue: number;
  avgRevenue: number;
}

interface MonthlyReport {
  month: string;
  totalSales: number;
  totalRevenue: number;
  avgRevenue: number;
  growth: number;
}

interface ProductReport {
  rank: number;
  productName: string;
  category: string;
  salesCount: number;
  totalRevenue: number;
  revenuePercent: number;
}

interface ReportSummary {
  revenue: number;
  revenueChange: number;
  salesCount: number;
  salesChange: number;
  avgBasket: number;
  topItem: string;
}
```

`invoiceNo` ve bazı “fatura” adları type seviyesinde tarihsel olarak durur; UI'nın bazı yerlerinde “satış” dili kullanılır.

## Dashboard

```ts
interface DashboardStats {
  dailyRevenue: number;
  dailyRevenueChange: number;
  totalSalesCount: number;
  criticalStockCount: number;
  activeUserCount: number;
  activeUserRole: string;
}

interface RecentSale {
  id: string;
  date: string;
  product: string;
  customer: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
}

interface StockItem {
  product: string;
  current: number;
  min: number;
  max: number;
}
```

Dashboard'ın `StockItem` tipi stock feature `Product` modeli değildir.

## Transactions

Transactions ayrı types dosyası yerine report/log/stock/sales tiplerini import eder. Hook şu tipi export eder:

```ts
type DatePreset = 'today' | 'weekly' | 'monthly' | 'quarterly';
```

Ancak canlı hook başlangıç değerini `'daily' as DatePreset` ile kurar. Bu, type assertion ile saklanmış bir runtime/type uyumsuzluğudur.

## Kimlik, tarih ve para biçimleri

- Mock ID'ler çoğunlukla kısa sabit string veya `Date.now()` tabanlı stringdir; UUID garantisi yoktur.
- Tarihler ISO değildir; birçok CRUD servisi `toLocaleString('tr-TR')`, seed verileri farklı metin formatları kullanır.
- Para alanları `number`dır; decimal/currency value object veya kuruş tabanlı integer modeli yoktur.
- Telefon, TC, VKN ve barkod sayısal anlam taşısa da baştaki sıfırları korumak için stringdir.
- Mock kullanıcı parolası plaintext tutulur; üretim modeli olarak kullanılmamalıdır.

## Sahiplik ve ilişkiler özeti

| İlişki | Canlı uygulama |
|---|---|
| route `businessId` → stock `dealerId` | uygulanıyor |
| route `businessId` → layout dealer | uygulanıyor |
| dealer `assignedUserIds` → users | aynı runtime içinde uygulanıyor |
| business → dealer | mapping ile uygulanıyor |
| sale `bayiId` → route business | uygulanmıyor; yeni satış `d1` |
| sale items → stock products | uygulanmıyor; ayrı koleksiyon |
| sales customer → customers feature | uygulanmıyor; ayrı koleksiyon |
| reports/logs/dashboard → CRUD verileri | uygulanmıyor; sabit mock veri |
