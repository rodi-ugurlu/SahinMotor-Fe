# 01 - Project Overview & Tech Stack

## 📌 Executive Summary

`SahinMotor-Fe` is a modern, enterprise-grade Web Application built for the management of motorcycle sales, servicing, equipment retail, dealer management, customer management, inventory control, and financial transaction auditing across multi-brand dealer ecosystems (specifically **Şahin Motor** and **Koman Motor**).

The application provides a seamless single-page application (SPA) experience with responsive navigation, role-based user authorization, real-time-like in-memory notifications, transaction history, stock critical alert tracking, and interactive reporting dashboards.

---

## 🏢 Business Domain & Brand Structure

### 1. Şahin Motor
- **Focus**: Brand-new & pre-owned motorcycle sales, maintenance, repair services, replacement parts, ECU programming, hydraulic/pneumatic service management.
- **Audience**: End-user motorcycle buyers, service customers, fleet owners, mechanics.

### 2. Koman Motor
- **Focus**: Riding accessories, helmets (e.g. LS2, AGV), jackets, gloves, boots, protective equipment, motorcycle gear distribution.
- **Audience**: B2B dealers, retail equipment buyers, accessory shops.

### 3. Multi-Dealer Platform
- Users log in, select their active business/dealer (e.g., *Şahin Motor*, *Koman Motor*), and navigate to dealer-scoped administrative views.

---

## 🛠 Technology Stack & Version Matrix

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | React | `^19.2.8` | UI Library & Component Tree |
| **Language** | TypeScript | `~6.0.2` | Type Safety & Strict Interfaces |
| **Build Tool** | Vite | `^8.2.0` | Dev Server & Lightning Fast HMR |
| **Routing** | React Router DOM | `^7.18.2` | Data Router / Declarative Browser Routing |
| **UI Kit** | Ant Design (`antd`) | `^6.5.3` | Form Controls, Modals, Tables, Cards, Badges, Typography |
| **Icons** | `@ant-design/icons` | Latest | Crisp Vector UI Icons |
| **Styling** | Vanilla CSS / BEM | CSS3 | Component & Layout Specific Modular Styling |
| **Typography** | Google Fonts | `Poppins` | Clean Turkish Character Set Typography |
| **State Management** | React Hooks + `useSyncExternalStore` | Native React 19 | Lightweight, decoupled global notifications & local state |

---

## ⚙️ NPM Scripts & Environment Setup

Commands defined in [`package.json`](file:///home/just-z/Desktop/SahinMotor-Fe/package.json):

```bash
# Start Vite Development Server
npm run dev

# Type check & Production Build (Vite + TypeScript)
npm run build

# Run ESLint across code base
npm run lint

# Preview Production Build locally
npm run preview
```

---

## 🎯 Core Capabilities & Value Delivery

1. **Authentication & Multi-Dealer Switcher**: Dynamic branded login screens, dealer selection grid with instant layout re-branding.
2. **Sales POS & Invoice Engine**: Multi-item sales cart, automated discount calculation (percentage & fixed), 20% KDV tax computation, payment method selection (Cash, Credit Card, Bank Wire).
3. **Inventory & Stock Management**: Product barcode scanning, brand/model size matrix, critical stock threshold alerts (`stock <= minStock`).
4. **Customer CRM**: Billing addresses, Turkish TC/VKN tax identification, formatted phone numbers.
5. **Role-Based User Management**: SuperAdmin, Admin, Personel, and Guest permissions with color-coded role tags.
6. **Audit & Log Tracking**: Comprehensive event history, user action logging, IP logging, before/after field changes.
7. **Analytics & Reports**: Daily, weekly, monthly sales breakdown, growth metrics, top revenue products ranking.
