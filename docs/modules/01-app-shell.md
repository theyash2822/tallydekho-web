# Module 01 — App Shell

## Overview
The global layout wrapper for the entire TD Web Portal. All modules render inside this shell.

## Components
- **TopBar**: Logo ("TD"), company name, period selector (FY + Month), user avatar
- **Sidebar**: Collapsible left nav with grouped links to all 14 modules
- **Breadcrumb**: Shows current module path (e.g. Financials > Cash & Bank)
- **Main Content Area**: Where each module renders

## Sidebar Groups
- Home
- Financials: Cash & Bank, Receivables & Payables, Loans & ODs, Reports
- Compliance: GST, E-Way Bill, E-Invoice, Other Taxes, Audit Trail
- Ledgers
- AI Insights
- Settings

## Design
- Sidebar: Deep navy (#0F172A), white text, blue active state
- TopBar: White, subtle border-bottom shadow
- Layout: Sidebar fixed left (240px), content area fills rest
