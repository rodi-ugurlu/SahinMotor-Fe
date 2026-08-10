# SahinMotor-Fe - Project Context Index & AI Agent Guidelines

> **Notice for AI Agents**: This directory (`project-context/`) contains comprehensive architectural, domain, schema, and technical specifications for `SahinMotor-Fe`. Always consult these documents before modifying or creating features in this repository.

---

## 📚 Document Index

| Document | Description |
| :--- | :--- |
| [01-PROJECT-OVERVIEW.md](file:///home/just-z/Desktop/SahinMotor-Fe/project-context/01-PROJECT-OVERVIEW.md) | High-level business domain, core objectives, tech stack, and project scripts. |
| [02-ARCHITECTURE-AND-ROUTING.md](file:///home/just-z/Desktop/SahinMotor-Fe/project-context/02-ARCHITECTURE-AND-ROUTING.md) | Directory layout, React Router v7 routes, `DashboardLayout`, shared utilities, & pub-sub events. |
| [03-AUTH-AND-BUSINESS-DOMAINS.md](file:///home/just-z/Desktop/SahinMotor-Fe/project-context/03-AUTH-AND-BUSINESS-DOMAINS.md) | Multi-brand authentication (Şahin Motor & Koman Motor), business selection, roles, location data, & service specialties. |
| [04-FEATURE-MODULES-AND-SERVICES.md](file:///home/just-z/Desktop/SahinMotor-Fe/project-context/04-FEATURE-MODULES-AND-SERVICES.md) | Detailed walkthrough of all 9 feature modules: Sales, Stock, Customers, Dealers, Users, Transactions, Logs, Dashboard, Reports. |
| [05-DATA-MODELS-AND-TYPES.md](file:///home/just-z/Desktop/SahinMotor-Fe/project-context/05-DATA-MODELS-AND-TYPES.md) | Complete index of TypeScript interfaces, type definitions, and constant mappings across the codebase. |
| [06-DEVELOPMENT-AND-CONVENTIONS.md](file:///home/just-z/Desktop/SahinMotor-Fe/project-context/06-DEVELOPMENT-AND-CONVENTIONS.md) | Design patterns (Custom Hooks + Service pattern), form validation rules, styling guidelines, and AI agent workflow conventions. |

---

## 🛠 Project Snapshot

- **Project Name**: `sahinmotor-fe`
- **Primary Domain**: B2B/B2C Motorcycle Sales, Repair & Maintenance, Equipment E-Commerce & Multi-Dealer Management System.
- **Key Brands**:
  - **Şahin Motor**: Zero/Used Motorcycle Sales, Maintenance & Repair Services.
  - **Koman Motor**: Helmets, Jackets, Protective Gear & Riding Accessories.
- **Core Tech Stack**: React 19, TypeScript 6, Vite 8, React Router v7, Ant Design (`antd`) v6, Custom CSS / BEM.
- **Data Layer**: Service Layer with Async Promises and Mock Data (Ready for REST API / GraphQL integration).

---

## 🤖 Instructions for AI Agents Working on This Repository

1. **Maintain Feature-Sliced Module Structure**: Keep feature-specific code inside `src/features/<feature-name>/` (containing `components/`, `hooks/`, `pages/`, `services/`, `types/`).
2. **Follow Custom Hook + Service Pattern**: Pages should consume custom hooks (e.g., `useSales`, `useStock`), which call service layer functions (e.g., `salesService.ts`, `stockService.ts`).
3. **Preserve UI Aesthetics**: Use Ant Design v6 components styled with clean CSS, Turkish localization, responsive layouts, and Poppins font.
4. **Use Shared Utilities**:
   - `src/shared/notifications.ts` for reactive state using `useSyncExternalStore`.
   - `src/shared/events.ts` for pub-sub global events (`on`, `emit`).
   - `src/shared/validation.ts` for Turkish phone number formatting & password rules.
   - `src/shared/image.ts` for file-to-Base64 conversions.
5. **Update Context Documentation**: Whenever adding new features, schemas, or routing paths, update the relevant documents in this `project-context/` directory.
