# 03 - Auth & Business Domains

## 🔐 Authentication Module (`src/features/auth/`)

The authentication module manages login, registration, password resets, location datasets, and service specialty classifications.

### Core Types (`src/features/auth/types/auth.ts`)

```typescript
export type UserRole = 'sahin' | 'koman' | 'admin' | null;
export type AuthRole = 'sahin' | 'koman';
export type AuthView = 'login' | 'register';

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
```

---

## 🔑 Demo Authentication Credentials

The auth service ([`authService.ts`](file:///home/just-z/Desktop/SahinMotor-Fe/src/features/auth/services/authService.ts)) contains built-in mock validation logic:

- **Demo Email**: `test@test.com`
- **Demo Password**: `Test123!`
- **Behavior**:
  - Logging in with role `'sahin'` returns user `{ name: 'Test Müşteri', role: 'sahin' }`.
  - Logging in with role `'koman'` returns user `{ name: 'Test Bayi', role: 'koman' }`.
  - On successful login, user is routed to `/select-business`.
  - **Şifremi Unuttum (Forgot Password)**: Clicking the link on the login page validates the email input inline without navigating away. If invalid, displays `"Geçici şifrenizi gönderebilmemiz için mail adresinizi giriniz."`. If valid, triggers temporary password request and displays `"Bu maille kayıtlı bir hesabınız varsa geçici şifreniz gönderilmiştir."`.

---

## 🏢 Business & Dealer Switcher Domain (`src/features/business/`)

After logging in, users arrive at [`BusinessSelectionPage`](file:///home/just-z/Desktop/SahinMotor-Fe/src/features/business/pages/BusinessSelectionPage.tsx), which loads registered dealers via `businessService.getBusinesses()` (mapped directly from `dealersService.getDealers()`).

### Business Card Entity (`src/features/business/types/business.ts`)

```typescript
export interface Business {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
}
```

### Business Card UI Component (`BusinessCard.tsx`)
- Renders avatar with image or initial letter.
- Clicking "Yönet" navigates to `/:businessId/sales`.

---

## 📍 Geographical Datasets (`src/features/auth/lib/locations.ts`)

Includes a complete dictionary of **20 Major Turkish Cities** and their respective districts:
- **Cities Supported**: Adana, Ankara, Antalya, Bursa, Denizli, Diyarbakır, Eskişehir, Gaziantep, Hatay, İstanbul (39 districts), İzmir, Kayseri, Kocaeli, Konya, Malatya, Manisa, Mersin, Sakarya, Samsun, Tekirdağ, Trabzon.
- **Helper Functions**:
  - `districtsForCity(city?: string)`: Returns string array of districts.
  - `firstDistrictForCity(city?: string)`: Helper to set default district values.
  - `normalizeDistrictList(values: string[])`: Trims & dedupes district arrays.

---

## 🛠 Service Specialties & Tags (`src/features/auth/lib/serviceExpertise.ts`)

Used for dealer/service categorization:

### Categories (`TicketCategory`)
1. **Motor**: Motor repair & rebuild.
2. **Elektrik**: Electrical & wiring.
3. **Hidrolik**: Hydraulic systems.
4. **Pnömatik**: Pneumatic systems.
5. **GenelBakim**: General periodic maintenance.
6. **ECU**: ECU remapping & electronics software.

### Suggested Expertise Tag List (`suggestedExpertiseTags`)
Contains 50+ normalized Turkish motorcycle tags (e.g. *motor, şanzıman, debriyaj, fren, enjeksiyon, kask, zincir, buji, radyatör, rot balans, kam mili*).
Includes normalization helpers:
- `normalizeExpertiseTag(value: string)`
- `normalizeSearchText(value: string)`: Replaces Turkish characters (`ı` -> `i`, `ğ` -> `g`, `ü` -> `u`, `ş` -> `s`, `ö` -> `o`, `ç` -> `c`) for fast, non-diacritic search indexing.
