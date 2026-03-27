import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppShell from './layouts/AppShell';
import Login from './pages/auth/Login';
import OTPScreen from './pages/auth/OTPScreen';
import GetStarted from './pages/auth/GetStarted';
import Notifications from './pages/Notifications';
import Dashboard from './pages/Dashboard';
import CashBank from './pages/financials/CashBank';
import ReceivablesPayables from './pages/financials/ReceivablesPayables';
import LoansODs from './pages/financials/LoansODs';
import Reports from './pages/financials/Reports';
import GST from './pages/compliance/GST';
import EWayBill from './pages/compliance/EWayBill';
import EInvoice from './pages/compliance/EInvoice';
import OtherTaxes from './pages/compliance/OtherTaxes';
import AuditTrail from './pages/compliance/AuditTrail';
import Ledgers from './pages/Ledgers';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';
import SalesModule from './pages/sales/SalesModule';
import PurchaseModule from './pages/purchase/PurchaseModule';
import InventoryModule from './pages/inventory/InventoryModule';
import ExpensesModule from './pages/expenses/ExpensesModule';
import PaymentsModule from './pages/payments/PaymentsModule';

// Protect routes — redirect to login if not authenticated
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/auth/login" replace />;
  return children;
}

// Redirect logged-in users away from auth pages
function AuthRoute({ children }) {
  const { token } = useAuth();
  if (token) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/auth/otp" element={<AuthRoute><OTPScreen /></AuthRoute>} />
      <Route path="/auth/get-started" element={<ProtectedRoute><GetStarted /></ProtectedRoute>} />

      {/* Protected app routes */}
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
          <Route path="sales" element={<SalesModule />} />
          <Route path="purchase" element={<PurchaseModule />} />
          <Route path="inventory" element={<InventoryModule />} />
          <Route path="expenses" element={<ExpensesModule />} />
          <Route path="payments" element={<PaymentsModule />} />
        <Route path="financials/cash-bank" element={<CashBank />} />
        <Route path="financials/receivables-payables" element={<ReceivablesPayables />} />
        <Route path="financials/loans-ods" element={<LoansODs />} />
        <Route path="financials/reports" element={<Reports />} />
        <Route path="compliance/gst" element={<GST />} />
        <Route path="compliance/eway-bill" element={<EWayBill />} />
        <Route path="compliance/einvoice" element={<EInvoice />} />
        <Route path="compliance/other-taxes" element={<OtherTaxes />} />
        <Route path="compliance/audit-trail" element={<AuditTrail />} />
        <Route path="ledgers" element={<Ledgers />} />
        <Route path="ai-insights" element={<AIInsights />} />
        <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
