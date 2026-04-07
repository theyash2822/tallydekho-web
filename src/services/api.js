// API Service — mirrors mobile app's apiService.js exactly
// Base URL: https://test.tallydekho.com/app

// Switch to your own backend when ready
// Local dev: http://localhost:3001/app
// Production AWS: https://your-domain.com/app
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/app';
const WS_URL   = import.meta.env.VITE_WS_URL  || 'http://localhost:3001';

const getToken = () => localStorage.getItem('authToken');

// ─── Core request ────────────────────────────────────────────────────────────
async function request(method, endpoint, body = null, skipAuth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (!skipAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.message || `HTTP ${res.status}`), { status: res.status, data: err });
  }
  return res.json();
}

const get  = (ep, opts)    => request('GET',    ep, null, opts?.skipAuth);
const post = (ep, b, opts) => request('POST',   ep, b,    opts?.skipAuth);
const put  = (ep, b)       => request('PUT',    ep, b);
const del  = (ep)          => request('DELETE', ep);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const sendOtp  = (mobileNumber, countryCode = '+91') => post('/send-otp',  { mobileNumber, countryCode }, { skipAuth: true });
export const verifyOtp= (mobileNumber, otp, countryCode = '+91') => post('/verify-otp',{ mobileNumber, otp, countryCode }, { skipAuth: true });
export const verifyToken = (token)          => post('/verify',    { token }, { skipAuth: true });
export const submitOnboarding = (body)      => post('/onboarding', body);
export const fetchMe         = ()           => get('/me');
export const updateMe        = (body)       => post('/me', body);

// ─── Pairing ──────────────────────────────────────────────────────────────────
export const pairDevice        = (pairingCode) => post('/pairing',        { pairingCode });
export const fetchPairingDetails = ()          => get('/pairing-device');
export const updatePairing     = (body)        => put('/pairing',         body);

// ─── Companies ───────────────────────────────────────────────────────────────
export const fetchCompanies = () => get('/companies');

// ─── Ledgers ──────────────────────────────────────────────────────────────────
export const fetchLedgers        = (body) => post('/ledgers', body);
export const fetchLedgerDetails  = (body) => post('/ledger',  body);
export const fetchLedgerVouchers = (body) => post('/ledger-vouchers', body);
export const fetchVoucherDetail  = (body) => post('/voucher-detail', body);  // { companyGuid, voucherId }

// ─── Stocks ───────────────────────────────────────────────────────────────────
export const fetchStockSummary = (companyGuid)       => post('/stock-dashboard', { companyGuid });
export const fetchStockFilters = (companyGuid)       => post('/stock-filters',   { companyGuid });
export const fetchStocks       = (body, signal)      => post('/stocks',          body);
export const fetchStockDetails = (body)              => post('/stock',           body);

// ─── Vouchers ─────────────────────────────────────────────────────────────────
export const fetchVouchers = (body) => post('/vouchers', body);

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const fetchDashboard = (body) => post('/dashboard', body);

// ─── Reports ──────────────────────────────────────────────────────────────────
export const fetchReportsPL = (body) => post('/reports/pl', body);
export const fetchReportsBS           = (body) => post('/reports/balance-sheet', body);
export const fetchCashBank            = (body) => post('/cash-bank', body);
export const fetchReceivablesPayables = (body) => post('/receivables-payables', body);
export const fetchExpenses            = (body) => post('/expenses', body);
export const fetchGSTSummary          = (body) => post('/gst-summary', body);

// ─── Tally Write API (creates vouchers/masters in Tally via desktop proxy) ────
// Note: /tally/* routes are on root, not /app — use separate base URL
const TALLY_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/app', '')
  : 'http://localhost:3001';

async function tallyRequest(endpoint, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${TALLY_BASE}${endpoint}`, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw Object.assign(new Error(e.message||`HTTP ${res.status}`), { status: res.status }); }
  return res.json();
}

export const createSalesInvoice    = (b) => tallyRequest('/tally/voucher/sales',         b);
export const createSalesOrder      = (b) => tallyRequest('/tally/voucher/sales-order',    b);
export const createPurchaseInvoice = (b) => tallyRequest('/tally/voucher/purchase',       b);
export const createPurchaseOrder   = (b) => tallyRequest('/tally/voucher/purchase-order', b);
export const createPaymentVoucher  = (b) => tallyRequest('/tally/voucher/payment',        b);
export const createReceiptVoucher  = (b) => tallyRequest('/tally/voucher/receipt',        b);
export const createJournalVoucher  = (b) => tallyRequest('/tally/voucher/journal',        b);
export const createContraVoucher   = (b) => tallyRequest('/tally/voucher/contra',         b);
export const createCreditNote      = (b) => tallyRequest('/tally/voucher/credit-note',    b);
export const createDebitNote       = (b) => tallyRequest('/tally/voucher/debit-note',     b);
export const createDeliveryNote    = (b) => tallyRequest('/tally/voucher/delivery-note',  b);
export const cancelVoucher         = (b) => tallyRequest('/tally/voucher/cancel',         b);
export const createPartyInTally    = (b) => tallyRequest('/tally/master/party',           b);
export const createWarehouseInTally= (b) => tallyRequest('/tally/master/warehouse',       b);
export const createStockItemInTally= (b) => tallyRequest('/tally/master/stock-item',      b);

// ─── Default export (object style — matches mobile usage pattern) ─────────────
const api = {
  // Auth
  sendOtp, verifyOtp, verifyToken, submitOnboarding, fetchMe, updateMe,
  // Pairing
  pairDevice, fetchPairingDetails, updatePairing,
  // Companies
  fetchCompanies,
  // Ledgers
  fetchLedgers, fetchLedgerDetails, fetchLedgerVouchers, fetchVoucherDetail,
  // Stocks
  fetchStockSummary, fetchStockFilters, fetchStocks, fetchStockDetails,
  // Vouchers & Reports
  fetchVouchers, fetchDashboard, fetchReportsPL, fetchReportsBS,
  fetchCashBank, fetchReceivablesPayables, fetchExpenses, fetchGSTSummary,
  // Tally Write
  createSalesInvoice, createSalesOrder, createPurchaseInvoice, createPurchaseOrder,
  createPaymentVoucher, createReceiptVoucher, createJournalVoucher, createContraVoucher,
  createCreditNote, createDebitNote, createDeliveryNote, cancelVoucher,
  createPartyInTally, createWarehouseInTally, createStockItemInTally,
};

export { WS_URL };
export default api;
