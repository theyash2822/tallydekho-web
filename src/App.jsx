import { lazy, Suspense, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppShell from './layouts/AppShell';

const Login = lazy(() => import('./pages/auth/Login'));
const OTPScreen = lazy(() => import('./pages/auth/OTPScreen'));
const GetStarted = lazy(() => import('./pages/auth/GetStarted'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CashBank = lazy(() => import('./pages/financials/CashBank'));
const ReceivablesPayables = lazy(() => import('./pages/financials/ReceivablesPayables'));
const LoansODs = lazy(() => import('./pages/financials/LoansODs'));
const Reports = lazy(() => import('./pages/financials/Reports'));
const GST = lazy(() => import('./pages/compliance/GST'));
const EWayBill = lazy(() => import('./pages/compliance/EWayBill'));
const EInvoice = lazy(() => import('./pages/compliance/EInvoice'));
const OtherTaxes = lazy(() => import('./pages/compliance/OtherTaxes'));
const AuditTrail = lazy(() => import('./pages/compliance/AuditTrail'));
const Ledgers = lazy(() => import('./pages/Ledgers'));
const AIInsights = lazy(() => import('./pages/AIInsights'));
const Settings = lazy(() => import('./pages/Settings'));
const SalesModule = lazy(() => import('./pages/sales/SalesModule'));
const PurchaseModule = lazy(() => import('./pages/purchase/PurchaseModule'));
const InventoryModule = lazy(() => import('./pages/inventory/InventoryModule'));
const ExpensesModule = lazy(() => import('./pages/expenses/ExpensesModule'));
const PaymentsModule = lazy(() => import('./pages/payments/PaymentsModule'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-6 h-6 border-2 border-[#3F5263] border-t-transparent rounded-full animate-spin" />
  </div>
);

// Error boundary - catches render crashes and shows login instead of blank
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.error('[TallyDekho] Render error:', err.message); }
  render() {
    if (this.state.hasError) {
      // Clear bad state and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login';
      return null;
    }
    return this.props.children;
  }
}

// Protect routes — redirect to login if not authenticated
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/auth/login" replace />;
  return children;
}

// Redirect logged-in users away from auth pages
// Note: OTP page is excluded from redirect to prevent crash during login flow
function AuthRoute({ children }) {
  const { token } = useAuth();
  const isOTPPage = window.location.pathname === '/auth/otp';
  if (token && !isOTPPage) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
