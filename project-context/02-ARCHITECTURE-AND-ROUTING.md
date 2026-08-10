# 02 - Architecture, Routing & Shared Utilities

## 📂 Directory & Modular File Structure

The project follows a **Feature-Sliced Architecture** for scalability, clean separation of concerns, and easy maintenance.

```
SahinMotor-Fe/
├── public/                     # Static assets & favicons
├── project-context/            # AI Agent & Developer project documentation
├── src/
│   ├── app/                    # Application global context / providers (if extended)
│   ├── components/             # App-wide global UI components & modals
│   │   ├── PasswordModal.tsx   # Password change modal with validation
│   │   └── ProfileModal.tsx    # User profile & avatar update modal
│   ├── features/               # Feature-sliced domain modules
│   │   ├── auth/               # Login, register, location data, specialty tags
│   │   ├── business/           # Business selection & dealer switcher
│   │   ├── customers/          # Customer CRM & billing profiles
│   │   ├── dashboard/          # Summary metrics & quick overview
│   │   ├── dealers/            # Dealer management & user assignment
│   │   ├── logs/               # Audit trail, IP logging, before/after diffs
│   │   ├── reports/            # Daily/weekly/monthly revenue analytics
│   │   ├── sales/              # Point of sale, cart calculation, invoices
│   │   ├── stock/              # Inventory management & product modals
│   │   ├── transactions/       # Aggregated activities & log viewer
│   │   └── users/              # System user management & permissions
│   ├── layouts/                # Main app layout frames
│   │   ├── DashboardLayout.css # Dashboard layout responsive styling
│   │   └── DashboardLayout.tsx # Collapsible sidebar, header, popovers
│   ├── pages/                  # Top-level fallback pages
│   │   └── NotFoundPage.tsx    # 404 Error page
│   ├── router/                 # React Router routing configuration
│   │   └── AppRouter.tsx       # Browser router definition
│   ├── shared/                 # Reusable cross-feature utilities
│   │   ├── events.ts           # Pub-Sub event emitter for cross-component triggers
│   │   ├── image.ts            # Base64 image reader utility
│   │   ├── notifications.ts    # Reactive in-memory store (useSyncExternalStore)
│   │   └── validation.ts       # Phone mask formatter & password regex rule
│   ├── App.tsx                 # Root application wrapper
│   ├── index.css               # Global CSS reset & typography rules
│   └── main.tsx                # Application entrypoint & DOM mount
├── .gitignore                  # Git exclusion configuration (includes project-context/)
├── index.html                  # HTML template with Google Fonts (Poppins)
├── package.json                # Project dependencies & npm scripts
├── tsconfig.json               # TypeScript base configuration
├── tsconfig.app.json           # Application TypeScript build configuration
└── vite.config.ts              # Vite bundler plugins & settings
```

---

## 🚦 Routing Architecture (`AppRouter.tsx`)

Routing is implemented using `react-router-dom` v7 with `createBrowserRouter`.

### Route Map Matrix

| Path | Component | Description |
| :--- | :--- | :--- |
| `/` | [`SahinLogin`](file:///home/just-z/Desktop/SahinMotor-Fe/src/features/auth/pages/SahinLogin.tsx) | Default landing page & authentication form. |
| `/sahin/login` | [`SahinLogin`](file:///home/just-z/Desktop/SahinMotor-Fe/src/features/auth/pages/SahinLogin.tsx) | Brand-specific login endpoint for Şahin Motor. |
| `/koman/login` | [`SahinLogin`](file:///home/just-z/Desktop/SahinMotor-Fe/src/features/auth/pages/SahinLogin.tsx) | Brand-specific login endpoint for Koman Motor. |
| `/select-business` | [`BusinessSelectionPage`](file:///home/just-z/Desktop/SahinMotor-Fe/src/features/business/pages/BusinessSelectionPage.tsx) | Dealer/business selection card grid. |
| `/:businessId` | [`DashboardLayout`](file:///home/just-z/Desktop/SahinMotor-Fe/src/layouts/DashboardLayout.tsx) | Parent layout with sidebar, header, avatar & notifications. |
| `/:businessId/` | [`SalesPage`](file:///home/just-z/Desktop/SahinMotor-Fe/src/features/sales/pages/SalesPage.tsx) | Default child index route (redirects view to Sales). |
| `/:businessId/sales` | [`SalesPage`](file:///home/just-z/Desktop/SahinMotor-Fe/src/features/sales/pages/SalesPage.tsx) | Sales POS, invoice creation & transaction table. |
| `/:businessId/stock` | [`StockPage`](file:///home/just-z/Desktop/SahinMotor-Fe/src/features/stock/pages/StockPage.tsx) | Inventory management & critical stock filters. |
| `/:businessId/customers` | [`CustomersPage`](file:///home/just-z/Desktop/SahinMotor-Fe/src/features/customers/pages/CustomersPage.tsx) | Customer CRM management. |
| `/:businessId/dealers` | [`DealersPage`](file:///home/just-z/Desktop/SahinMotor-Fe/src/features/dealers/pages/DealersPage.tsx) | Multi-dealer management & user assignment. |
| `/:businessId/users` | [`UsersPage`](file:///home/just-z/Desktop/SahinMotor-Fe/src/features/users/pages/UsersPage.tsx) | User accounts, roles & password resets. |
| `/:businessId/transactions` | [`TransactionsPage`](file:///home/just-z/Desktop/SahinMotor-Fe/src/features/transactions/pages/TransactionsPage.tsx) | Combined logs & financial analytics view. |
| `*` | [`NotFoundPage`](file:///home/just-z/Desktop/SahinMotor-Fe/src/pages/NotFoundPage.tsx) | 404 Fallback page. |

---

## 🎨 Layout & Shell Components (`DashboardLayout.tsx`)

`DashboardLayout` serves as the shell for all authenticated views. Key capabilities:
1. **Collapsible Sidebar**: Dynamic widths (240px expanded / 64px collapsed), collapsible via button or auto breakpoint (`lg`).
2. **Dynamic Branding Logo**: Fetches current dealer by `businessId` from URL parameter. Displays dealer logo image if available, or falls back to dealer name/initials.
3. **Business Switcher Link**: Bottom sider link to navigate back to `/select-business`.
4. **Header Navigation**:
   - Sidebar fold toggle.
   - Current business title.
   - Bell popover badge showing unread notifications with quick clear & navigation to `/transactions`.
   - User dropdown menu (Profile edit modal, Password update modal, Logout trigger).
5. **Modal Container**: Holds global instance of `ProfileModal` and `PasswordModal`.

---

## 🔄 Shared Utilities Deep-Dive

### 1. Global Pub-Sub Event Emitter ([`src/shared/events.ts`](file:///home/just-z/Desktop/SahinMotor-Fe/src/shared/events.ts))
Provides zero-dependency event publishing/subscribing. Used to update the Header dealer info when dealer profile details are edited (`dealerUpdated` event).

```typescript
export function emit(event: string);
export function on(event: string, fn: Listener): () => void; // Returns unsubscribe callback
```

### 2. Reactive In-Memory Notification Store ([`src/shared/notifications.ts`](file:///home/just-z/Desktop/SahinMotor-Fe/src/shared/notifications.ts))
Uses React 19's native `useSyncExternalStore` hook for reactive state synchronization without external state libraries.

```typescript
export interface Notification {
  id: string;
  message: string;
  time: string;
  type: 'sales' | 'stock' | 'login' | 'logout';
}
export function addNotification(n: Omit<Notification, 'id' | 'time'>);
export function clearNotifications();
export function useNotifications(): Notification[];
```

### 3. Phone & Password Validation Helpers ([`src/shared/validation.ts`](file:///home/just-z/Desktop/SahinMotor-Fe/src/shared/validation.ts))
- `formatPhoneNumber(value: string)`: Converts raw numbers to `(5XX) XXX XX XX` Turkish format.
- `validatePasswordRule(_, value: string)`: Ant Design rule validator enforcing minimum 6 characters, uppercase, lowercase, digit, and special character.

### 4. Base64 Converter ([`src/shared/image.ts`](file:///home/just-z/Desktop/SahinMotor-Fe/src/shared/image.ts))
- `getBase64(file: File): Promise<string>`: Converts image upload objects to Base64 data URLs for inline previewing and storage.
