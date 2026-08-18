# 04 - Feature Modules & Services Walkthrough

This document presents an exhaustive breakdown of the 9 core business feature modules.

---

## 🛍 1. Sales Module (`src/features/sales/`)

Manages retail sales transactions, customer cart generation, tax calculations, invoice status management, and historical sales records.

### Key Workflows
- **New Sale Modal**: Select customer, add products from stock catalog, configure quantities, unit prices, and discount percentages.
- **Financial Computations**:
  - `Subtotal` = `sum(unitPrice * quantity)`
  - `DiscountAmount` = `(unitPrice * quantity) * (discountPercent / 100)`
  - `Tax (KDV 20%)` = `(Subtotal - DiscountTotal) * 0.20`
  - `GrandTotal` = `Subtotal - DiscountTotal + Tax`
- **Payment Methods**: `'kart'` (Credit Card), `'nakit'` (Cash), `'havale'` (Bank Transfer).
- **Status Lifecycle**: `'taslak'` (Draft) ➔ `'beklemede'` (Pending) ➔ `'bitti'` (Completed) or `'iptal'` (Cancelled).
- **Customer Types**: `'individual'` (Bireysel) / `'company'` (Kurumsal) — form fields switch between TC Kimlik No and VKN/Vergi Dairesi.
- **Cart Table**: Quantity & discount inputs use Ant Design `InputNumber` with up/down controls; discount input has `%` suffix.
- **Sales List Filters**: Status Tag filters (Tümü/Tamamlandı/Taslak/İptal), customer name/phone search, and a `RangePicker` (dayjs) calendar popover for date range filtering (`DD.MM.YYYY`).
- **Proforma Preview**: Two-column info layout — left: Müşteri/E-posta, right: Telefon/Ödeme Yöntemi; print/PDF via `window.print()`.
- **Barcode Overlay**: Camera-style overlay with manual barcode input; adds product to cart on match.

---

## 📦 2. Stock / Inventory Module (`src/features/stock/`)

Manages inventory catalog, product barcodes, purchase/sale pricing, sizes, colors, and stock level alerts.

### Key Features
- **Stock Filter Modes**: `'all'` (All Products), `'critical'` (`stock <= minStock`), `'normal'` (`stock > minStock`).
- **Product Modal (`ProductFormModal.tsx`)**: Form for creating/editing product entries (Barcode, Name, Brand, Model, Size, Color, Purchase Price, Sale Price, Current Stock, Critical Min Stock).
- **Service API**: `getProducts()`, `addProduct()`, `updateProduct()`, `deleteProduct()`.

---

## 👥 3. Customers CRM Module (`src/features/customers/`)

Manages customer billing information, Turkish identity (TC) / Tax identification numbers (VKN), phone numbers, and addresses.

### Data Attributes
- `fullName`: Customer full name
- `type`: `'individual'` (Bireysel) or `'company'` (Kurumsal)
- `tc`: 11-digit Turkish Identity Number (individual only)
- `vkn`: 10-digit Tax Identification Number (company only)
- `taxOffice`: Tax Office jurisdiction name (company only)
- `billingAddress`: Complete official billing address string
- `phone`: Formatted contact phone number
- `email`: Contact email address

### UI Features
- **Type Filter**: Tag buttons (Tümü/Bireysel/Kurumsal) instead of Select dropdown.
- **Search**: Name, phone, TC, VKN, tax office.
- **Detail Drawer**: Eye icon opens customer detail with Descriptions.
- **Form Modal**: Radio toggle between Bireysel/Kurumsal switches TC vs VKN fields.

---

## 🏢 4. Dealers Module (`src/features/dealers/`)

Manages multiple dealer branches/franchises and assigns user accounts to specific dealers.

### Capabilities
- **Dealer Entity**: ID, Name, Description, Logo URL, Assigned User IDs array (`assignedUserIds`), Creation Date.
- **User Assignment**: `assignUserToDealer(dealerId, userId)` & `removeUserFromDealer(dealerId, userId)`.
- **Global Event Sync**: Emits `dealerUpdated` event to refresh header logo across the app layout.

---

## 👤 5. Users & Roles Module (`src/features/users/`)

Manages user authentication accounts, system access levels, and password reset requests.

### Role Hierarchy & Badges
- **`SuperAdmin`** (`#E32727` - Red): Full system & dealer configuration access.
- **`Admin`** (`#3B82F6` - Blue): Dealer administration, stock, sales & reporting.
- **`Personel`** (`#22C55E` - Green): Sales & customer interaction rights.
- **`Guest`** (`#94A3B8` - Slate Gray): Read-only access (e.g. Accountants / Auditors).

---

## 📊 6. Reports & Analytics Module (`src/features/reports/`)

Calculates financial analytics across daily, weekly, and monthly periods.

### Key Metrics (`ReportSummary`)
- **Revenue**: Period total turnover in TL (₺).
- **Revenue Change**: Percentage growth relative to previous period.
- **Sales Count**: Total number of completed sales.
- **Average Basket Size**: Average invoice amount per sale (`Revenue / SalesCount`).
- **Top Performing Products**: Product ranking by total revenue and revenue percentage share.

---

## 🕵️‍♂️ 7. Audit Logs Module (`src/features/logs/`)

Maintains an immutable audit log of sensitive system operations for compliance and tracking.

### Log Entry Attributes (`LogEntry`)
- `id`: Log ID (e.g. `log-001`)
- `date`: Timestamp string (`DD.MM.YYYY HH:mm:ss`)
- `user`: Performing user (ID, Name, Role, Color)
- `type`: Category (`sales` | `stock` | `login` | `logout`)
- `module`: Target system module (`Satış` | `Stok Yönetimi` | `Auth`)
- `description`: Action overview summary
- `detail`: Detailed description text
- `ip`: Client IP address string (e.g. `192.168.1.100`)
- `changes`: Array of field diff objects `{ field, oldValue, newValue }`

---

## ⚡️ 8. Transactions View Module (`src/features/transactions/`)

Combines financial reporting summary cards, stock value metrics (total item count & inventory TL value), log filters, and interactive activity timelines in a unified single-page layout.

---

## 📈 9. Dashboard Overview Module (`src/features/dashboard/`)

Provides high-level KPI stat cards (Daily Revenue, Revenue Change %, Total Sales Count, Critical Stock Alert Count, Active User Count) along with quick tables for recent transactions and critical stock status.
