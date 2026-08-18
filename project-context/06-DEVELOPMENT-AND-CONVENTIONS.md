# 06 - Development Standards & Coding Guidelines

This document outlines conventions and strict guidelines for AI agents and human developers extending `SahinMotor-Fe`.

---

## 🎨 1. Design & UI System

1. **Component Library**: Use Ant Design (`antd`) v6 components (`Layout`, `Menu`, `Table`, `Card`, `Button`, `Form`, `Input`, `Select`, `Modal`, `Upload`, `Avatar`, `Badge`, `Popover`, `Tag`, `Typography`, `Result`).
2. **Typography**: Always rely on standard `Poppins` font stack loaded via `index.html`.
3. **Color Palette Guidelines**:
   - **Primary Action / Danger Brand Color**: `#E32727` (Şahin Red).
   - **Admin / Primary Info Color**: `#3B82F6` (Blue).
   - **Success / Personel Color**: `#22C55E` (Green).
   - **Muted Gray / Text Secondary**: `#94A3B8` / `#64748B`.
   - **Background Dark / Sider**: `#0F172A` / `#1E293B`.
   - **Background Light**: `#F8FAFC` / `#F1F5F9`.
4. **Localization**: All UI labels, validation error messages, buttons, and notifications **MUST be in Turkish**.

---

## ⚡️ 2. State & Hook Design Pattern

- **Service Layer Isolation**: Never put inline `fetch` or complex API logic inside React component render logic. Write service functions in `src/features/<feature>/services/<feature>Service.ts`.
- **Custom Hooks**: Expose feature state and handler functions via custom hooks in `src/features/<feature>/hooks/use<Feature>.ts`.
- **Async Promises & Delay Simulation**: Mock APIs should return Promises with `setTimeout` (300ms - 500ms) to mirror realistic network latency and ensure loading spinners function properly.
- **State Standard**: Custom hooks should expose a unified `state` string: `'loading' | 'loaded' | 'empty' | 'error'`, along with a `retry` function.

---

## 📝 3. Form Validation & Ant Design Rules

1. **Ant Design Form Integration**: Form instances should be created using `Form.useForm()`.
2. **Phone Number Inputs**: Always use `formatPhoneNumber` from [`src/shared/validation.ts`](file:///home/just-z/Desktop/SahinMotor-Fe/src/shared/validation.ts) to format phone fields dynamically.
3. **Password Inputs**: Enforce `validatePasswordRule` for strong password policies (min 10 chars, uppercase, lowercase, digit, special character).
4. **Validation Failure Handling**: Display explicit, user-friendly Turkish error messages using Ant Design's `message.error(...)` or `message.success(...)`.
5. **Error Display Rule**: Do NOT show the same error twice (e.g. both in-form Alert and `message.error` toast). Prefer in-form `Alert` for auth errors; use `message.*` for action feedback (add/update/delete).

---

## 🔍 4. Checklist for AI Agents Adding New Features

When requested to create or modify a module in this repo, AI agents MUST perform the following steps:

- [ ] **Step 1**: Check if a feature module folder exists in `src/features/<feature-name>`.
- [ ] **Step 2**: Add/update domain interfaces in `src/features/<feature-name>/types/<feature-name>.ts`.
- [ ] **Step 3**: Implement mock service operations in `src/features/<feature-name>/services/<feature-name>Service.ts`.
- [ ] **Step 4**: Create custom state hook in `src/features/<feature-name>/hooks/use<Feature-Name>.ts`.
- [ ] **Step 5**: Build UI page/component in `src/features/<feature-name>/pages/<Feature-Name>Page.tsx` with appropriate `.css` stylesheet.
- [ ] **Step 6**: Register new route paths in [`src/router/AppRouter.tsx`](file:///home/just-z/Desktop/SahinMotor-Fe/src/router/AppRouter.tsx) and sidebar items in [`src/layouts/DashboardLayout.tsx`](file:///home/just-z/Desktop/SahinMotor-Fe/src/layouts/DashboardLayout.tsx) if needed.
- [ ] **Step 7**: Update `project-context/` documentation files to document the new feature.
- [ ] **Step 8**: Run build validation (`npm run build`) to ensure zero TypeScript errors or broken imports.
