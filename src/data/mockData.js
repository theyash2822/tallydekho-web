// ─── Company ───────────────────────────────────────────────────────────────
export const company = {
  name: 'Maaruji Industries Pvt. Ltd.',
  gstin: '27AABCM1234F1Z5',
  pan: 'AABCM1234F',
  address: '301, Mittal Court, Nariman Point, Mumbai – 400021',
  phone: '+91 98200 12345',
  email: 'accounts@maaruji.in',
  fy: '2025-26',
  period: 'July 2025',
};

// ─── Dashboard KPIs ────────────────────────────────────────────────────────
export const dashboardKPIs = {
  totalSales: 4580000,
  totalPurchase: 2840000,
  netProfit: 820000,
  cashBalance: 345000,
  receivables: 1280000,
  payables: 760000,
};

// ─── Monthly Chart Data ────────────────────────────────────────────────────
export const monthlySalesPurchase = [
  { month: 'Feb', sales: 3200000, purchase: 2100000 },
  { month: 'Mar', sales: 3800000, purchase: 2450000 },
  { month: 'Apr', sales: 4100000, purchase: 2600000 },
  { month: 'May', sales: 3750000, purchase: 2300000 },
  { month: 'Jun', sales: 4300000, purchase: 2700000 },
  { month: 'Jul', sales: 4580000, purchase: 2840000 },
];

export const profitTrend = [
  { month: 'Feb', profit: 680000 },
  { month: 'Mar', profit: 740000 },
  { month: 'Apr', profit: 790000 },
  { month: 'May', profit: 710000 },
  { month: 'Jun', profit: 800000 },
  { month: 'Jul', profit: 820000 },
];

// ─── Top Customers ─────────────────────────────────────────────────────────
export const topCustomers = [
  { name: 'Reliance Retail Ltd.', revenue: 980000, invoices: 12 },
  { name: 'ABC Traders', revenue: 760000, invoices: 9 },
  { name: 'Tata Consumer Products', revenue: 640000, invoices: 7 },
  { name: 'Metro Cash & Carry', revenue: 520000, invoices: 6 },
  { name: 'D-Mart Ltd.', revenue: 480000, invoices: 5 },
];

// ─── Alerts ────────────────────────────────────────────────────────────────
export const alerts = [
  { type: 'error', message: '5 invoices overdue — ₹3,40,000 pending collection' },
  { type: 'warning', message: 'GSTR-3B filing due in 3 days' },
  { type: 'warning', message: 'EMI due tomorrow: ₹1,10,000 (HDFC Term Loan)' },
  { type: 'info', message: '3 E-Way Bills expiring today' },
];

// ─── Cash & Bank ───────────────────────────────────────────────────────────
export const bankAccounts = [
  { id: 1, name: 'HDFC – CA 0259', balance: 1845000, availableBalance: 1845000, branch: 'Nariman Point', masked: 'XXXX XXXX 0259', odLimit: 5000000 },
  { id: 2, name: 'ICICI – CA 1147', balance: 920000, availableBalance: 920000, branch: 'BKC', masked: 'XXXX XXXX 1147' },
];

export const cashRegister = [
  { id: 1, date: '10 Jul 2025', ref: 'RCP-0045', description: 'Cash receipt – ABC Traders', dr: 45000, cr: 0, balance: 345000 },
  { id: 2, date: '09 Jul 2025', ref: 'PV-0112', description: 'Cash payment – Petty expenses', dr: 0, cr: 3200, balance: 300000 },
  { id: 3, date: '08 Jul 2025', ref: 'RCP-0044', description: 'Cash receipt – Metro Cash', dr: 28000, cr: 0, balance: 303200 },
  { id: 4, date: '07 Jul 2025', ref: 'PV-0111', description: 'Cash payment – Office supplies', dr: 0, cr: 5400, balance: 275200 },
  { id: 5, date: '05 Jul 2025', ref: 'RCP-0043', description: 'Cash receipt – D-Mart', dr: 60000, cr: 0, balance: 280600 },
  { id: 6, date: '03 Jul 2025', ref: 'PV-0110', description: 'Cash payment – Labour charges', dr: 0, cr: 12000, balance: 220600 },
  { id: 7, date: '01 Jul 2025', ref: 'RCP-0042', description: 'Opening cash balance', dr: 232600, cr: 0, balance: 232600 },
];

export const bankRegister = [
  { id: 1, date: '10 Jul 2025', ref: 'NEFT/2025071012345', description: 'Reliance Retail – Payment received', dr: 980000, cr: 0, balance: 1845000, status: 'Cleared' },
  { id: 2, date: '09 Jul 2025', ref: 'CHQ/002981', description: 'Office rent – Landlord', dr: 0, cr: 75000, balance: 865000, status: 'Cleared' },
  { id: 3, date: '08 Jul 2025', ref: 'UPI/20250708XYZ', description: 'ABC Traders – Part payment', dr: 250000, cr: 0, balance: 940000, status: 'Cleared' },
  { id: 4, date: '07 Jul 2025', ref: 'RTGS/20250707001', description: 'Supplier – Raw material purchase', dr: 0, cr: 420000, balance: 690000, status: 'Cleared' },
  { id: 5, date: '06 Jul 2025', ref: 'NEFT/2025070611111', description: 'Tata Consumer Products', dr: 640000, cr: 0, balance: 1110000, status: 'Cleared' },
  { id: 6, date: '05 Jul 2025', ref: 'UPI/20250705ABC', description: 'Insurance premium', dr: 0, cr: 18500, balance: 470000, status: 'Pending' },
  { id: 7, date: '04 Jul 2025', ref: 'CHQ/002980', description: 'Salary – July advance', dr: 0, cr: 150000, balance: 488500, status: 'Cleared' },
  { id: 8, date: '03 Jul 2025', ref: 'NEFT/2025070399999', description: 'Metro Cash & Carry', dr: 520000, cr: 0, balance: 638500, status: 'Cleared' },
  { id: 9, date: '02 Jul 2025', ref: 'CHQ/002979', description: 'Electricity bill', dr: 0, cr: 32000, balance: 118500, status: 'Reversed' },
  { id: 10, date: '01 Jul 2025', ref: 'Opening', description: 'Opening bank balance', dr: 150500, cr: 0, balance: 150500, status: 'Cleared' },
];

export const reconciliationData = {
  summary: { total: 10, matched: 7, pending: 3, difference: 32000 },
  bankStatement: [
    { id: 1, date: '10 Jul', description: 'NEFT CR – Reliance', debit: 980000, credit: 0, closing: 1845000, status: 'Matched' },
    { id: 2, date: '09 Jul', description: 'CHQ DR – 002981', debit: 0, credit: 75000, closing: 865000, status: 'Matched' },
    { id: 3, date: '08 Jul', description: 'UPI CR – XYZ', debit: 250000, credit: 0, closing: 940000, status: 'Matched' },
    { id: 4, date: '07 Jul', description: 'RTGS DR – Supplier', debit: 0, credit: 420000, closing: 690000, status: 'Matched' },
    { id: 5, date: '06 Jul', description: 'NEFT CR – Tata', debit: 640000, credit: 0, closing: 1110000, status: 'Suggested' },
    { id: 6, date: '05 Jul', description: 'UPI DR – Insurance', debit: 0, credit: 18500, closing: 470000, status: 'Unmatched' },
    { id: 7, date: '04 Jul', description: 'CHQ DR – Salary', debit: 0, credit: 150000, closing: 488500, status: 'Matched' },
    { id: 8, date: '03 Jul', description: 'NEFT CR – Metro', debit: 520000, credit: 0, closing: 638500, status: 'Unmatched' },
    { id: 9, date: '02 Jul', description: 'CHQ DR – BESCOM', debit: 0, credit: 32000, closing: 118500, status: 'Unmatched' },
    { id: 10, date: '01 Jul', description: 'Opening Balance', debit: 150500, credit: 0, closing: 150500, status: 'Matched' },
  ],
};

// ─── Receivables & Payables ────────────────────────────────────────────────
export const receivables = [
  { id: 1, party: 'ABC Traders', contact: '9820012345', outstanding: 380000, overdue: 120000, risk: 'High', aging: { d0_30: 260000, d31_60: 80000, d61_90: 40000, d90plus: 0 } },
  { id: 2, party: 'Reliance Retail Ltd.', contact: '9833011200', outstanding: 290000, overdue: 0, risk: 'Low', aging: { d0_30: 290000, d31_60: 0, d61_90: 0, d90plus: 0 } },
  { id: 3, party: 'Metro Cash & Carry', contact: '9867045678', outstanding: 210000, overdue: 85000, risk: 'Medium', aging: { d0_30: 125000, d31_60: 85000, d61_90: 0, d90plus: 0 } },
  { id: 4, party: 'Tata Consumer Products', contact: '9821098765', outstanding: 175000, overdue: 60000, risk: 'Medium', aging: { d0_30: 115000, d31_60: 60000, d61_90: 0, d90plus: 0 } },
  { id: 5, party: 'D-Mart Ltd.', contact: '9834022233', outstanding: 145000, overdue: 145000, risk: 'High', aging: { d0_30: 0, d31_60: 0, d61_90: 100000, d90plus: 45000 } },
  { id: 6, party: 'BigBasket', contact: '9845011122', outstanding: 80000, overdue: 0, risk: 'Low', aging: { d0_30: 80000, d31_60: 0, d61_90: 0, d90plus: 0 } },
];

export const payables = [
  { id: 1, party: 'Shree Polymers', contact: '9876543210', outstanding: 280000, overdue: 100000, risk: 'High', aging: { d0_30: 180000, d31_60: 100000, d61_90: 0, d90plus: 0 } },
  { id: 2, party: 'Bharat Chemicals', contact: '9867012345', outstanding: 190000, overdue: 0, risk: 'Low', aging: { d0_30: 190000, d31_60: 0, d61_90: 0, d90plus: 0 } },
  { id: 3, party: 'National Packaging', contact: '9845098765', outstanding: 145000, overdue: 55000, risk: 'Medium', aging: { d0_30: 90000, d31_60: 55000, d61_90: 0, d90plus: 0 } },
  { id: 4, party: 'Excel Logistics', contact: '9823011234', outstanding: 85000, overdue: 85000, risk: 'High', aging: { d0_30: 0, d31_60: 0, d61_90: 85000, d90plus: 0 } },
  { id: 5, party: 'Sunrise Electricals', contact: '9812044556', outstanding: 60000, overdue: 0, risk: 'Low', aging: { d0_30: 60000, d31_60: 0, d61_90: 0, d90plus: 0 } },
];

// ─── Loans & ODs ──────────────────────────────────────────────────────────
export const loans = [
  {
    id: 1, name: 'HDFC Term Loan', lender: 'HDFC Bank', accountNo: 'TL2021034567', type: 'Term Loan',
    status: 'Active', sanctioned: 5000000, disbursed: 5000000, outstanding: 3800000,
    interestRate: 9.5, tenure: 120, emiAmount: 110000, nextEmiDate: '15 Jul 2025',
    collateral: 'Factory Building – Bhiwandi', secured: true,
  },
  {
    id: 2, name: 'Axis Vehicle Loan', lender: 'Axis Bank', accountNo: 'VL2023089012', type: 'Vehicle Loan',
    status: 'Active', sanctioned: 800000, disbursed: 800000, outstanding: 520000,
    interestRate: 8.75, tenure: 60, emiAmount: 18500, nextEmiDate: '20 Jul 2025',
    collateral: 'Tata Ace HT – MH04 AB 1234', secured: true,
  },
];

export const odAccounts = [
  { id: 1, name: 'HDFC CC-001', bank: 'HDFC Bank', accountNo: 'CC2020012345', limit: 5000000, utilized: 3280000, interest: 12.5, status: 'Active' },
  { id: 2, name: 'ICICI CC-002', bank: 'ICICI Bank', accountNo: 'CC2022078901', limit: 3000000, utilized: 1800000, interest: 13.0, status: 'Active' },
];

export const emiSchedule = [
  { no: 1, date: '15 Aug 2021', principal: 52000, interest: 58000, emi: 110000, balance: 4948000, status: 'Paid' },
  { no: 2, date: '15 Sep 2021', principal: 53000, interest: 57000, emi: 110000, balance: 4895000, status: 'Paid' },
  { no: 47, date: '15 Jun 2025', principal: 74000, interest: 36000, emi: 110000, balance: 3874000, status: 'Paid' },
  { no: 48, date: '15 Jul 2025', principal: 74500, interest: 35500, emi: 110000, balance: 3799500, status: 'Due' },
  { no: 49, date: '15 Aug 2025', principal: 75000, interest: 35000, emi: 110000, balance: 3724500, status: 'Upcoming' },
  { no: 50, date: '15 Sep 2025', principal: 75500, interest: 34500, emi: 110000, balance: 3649000, status: 'Upcoming' },
];

// ─── Reports ──────────────────────────────────────────────────────────────
export const plData = {
  income: {
    directIncome: [
      { ledger: 'Sales Account', amount: 4580000 },
      { ledger: 'Service Charges', amount: 120000 },
    ],
    indirectIncome: [
      { ledger: 'Interest Received', amount: 45000 },
      { ledger: 'Discount Received', amount: 18000 },
    ],
  },
  expenses: {
    directExpense: [
      { ledger: 'Purchase Account', amount: 2840000 },
      { ledger: 'Freight Inward', amount: 85000 },
      { ledger: 'Packing Materials', amount: 62000 },
    ],
    indirectExpense: [
      { ledger: 'Salary & Wages', amount: 380000 },
      { ledger: 'Office Rent', amount: 75000 },
      { ledger: 'Electricity', amount: 32000 },
      { ledger: 'Bank Charges', amount: 8500 },
      { ledger: 'Depreciation', amount: 48000 },
      { ledger: 'Miscellaneous', amount: 12500 },
    ],
  },
  openingStock: 1200000,
  closingStock: 1450000,
};

export const balanceSheetData = {
  assets: {
    fixedAssets: [
      { ledger: 'Land & Building', amount: 8500000 },
      { ledger: 'Plant & Machinery', amount: 3200000 },
      { ledger: 'Vehicles', amount: 680000 },
      { ledger: 'Furniture & Fixtures', amount: 245000 },
    ],
    currentAssets: [
      { ledger: 'Closing Stock', amount: 1450000 },
      { ledger: 'Sundry Debtors', amount: 1280000 },
      { ledger: 'Cash in Hand', amount: 345000 },
      { ledger: 'Bank Balance', amount: 2765000 },
      { ledger: 'Loans & Advances', amount: 320000 },
    ],
  },
  liabilities: {
    capital: [
      { ledger: 'Capital Account', amount: 12000000 },
      { ledger: 'Reserves & Surplus', amount: 2840000 },
    ],
    longTermLiabilities: [
      { ledger: 'HDFC Term Loan', amount: 3800000 },
      { ledger: 'Axis Vehicle Loan', amount: 520000 },
    ],
    currentLiabilities: [
      { ledger: 'Sundry Creditors', amount: 760000 },
      { ledger: 'HDFC OD (CC-001)', amount: 3280000 },
      { ledger: 'ICICI OD (CC-002)', amount: 1800000 },
      { ledger: 'GST Payable', amount: 185000 },
      { ledger: 'TDS Payable', amount: 42000 },
    ],
  },
};

export const trialBalance = [
  { ledger: 'Sales Account', group: 'Direct Income', openingDr: 0, openingCr: 3200000, periodDr: 0, periodCr: 4580000, closingDr: 0, closingCr: 7780000 },
  { ledger: 'Purchase Account', group: 'Direct Expense', openingDr: 2100000, openingCr: 0, periodDr: 2840000, periodCr: 0, closingDr: 4940000, closingCr: 0 },
  { ledger: 'Salary & Wages', group: 'Indirect Expense', openingDr: 1900000, openingCr: 0, periodDr: 380000, periodCr: 0, closingDr: 2280000, closingCr: 0 },
  { ledger: 'Sundry Debtors', group: 'Current Assets', openingDr: 980000, openingCr: 0, periodDr: 1280000, periodCr: 0, closingDr: 1280000, closingCr: 0 },
  { ledger: 'Sundry Creditors', group: 'Current Liabilities', openingDr: 0, openingCr: 640000, periodDr: 0, periodCr: 760000, closingDr: 0, closingCr: 760000 },
  { ledger: 'Cash in Hand', group: 'Current Assets', openingDr: 232600, openingCr: 0, periodDr: 345000, periodCr: 0, closingDr: 345000, closingCr: 0 },
  { ledger: 'HDFC Bank CA', group: 'Bank Accounts', openingDr: 1200000, openingCr: 0, periodDr: 2765000, periodCr: 0, closingDr: 2765000, closingCr: 0 },
  { ledger: 'Capital Account', group: 'Capital', openingDr: 0, openingCr: 12000000, periodDr: 0, periodCr: 0, closingDr: 0, closingCr: 12000000 },
];

// ─── GST ──────────────────────────────────────────────────────────────────
export const gstr1Data = [
  { invoice: 'SI-2025-0782', customer: 'Reliance Retail Ltd.', gstin: '27AABCR0001A1Z3', taxable: 830508, cgst: 74746, sgst: 74746, igst: 0, pos: 'Maharashtra', status: 'Filed' },
  { invoice: 'SI-2025-0781', customer: 'ABC Traders', gstin: '27AABCA5678B1Z1', taxable: 644068, cgst: 57966, sgst: 57966, igst: 0, pos: 'Maharashtra', status: 'Filed' },
  { invoice: 'SI-2025-0780', customer: 'Tata Consumer Products', gstin: '27AADCT1234C1Z5', taxable: 542373, cgst: 48814, sgst: 48814, igst: 0, pos: 'Maharashtra', status: 'Pending' },
  { invoice: 'SI-2025-0779', customer: 'Metro Cash & Carry', gstin: '27AABCM9876D1Z7', taxable: 440678, cgst: 39661, sgst: 39661, igst: 0, pos: 'Maharashtra', status: 'Filed' },
  { invoice: 'SI-2025-0778', customer: 'D-Mart Ltd.', gstin: '27AABCD4321E1Z9', taxable: 406780, cgst: 36610, sgst: 36610, igst: 0, pos: 'Maharashtra', status: 'Filed' },
];

export const gstr2aData = [
  { supplier: 'Shree Polymers', gstin: '27AABCS5678F1Z3', invoice: 'PUR-1234', date: '05 Jul 2025', value: 280000, igst: 0, cgst: 25200, sgst: 25200, status: 'Matched' },
  { supplier: 'Bharat Chemicals', gstin: '27AABCB9876G1Z5', invoice: 'PUR-0987', date: '03 Jul 2025', value: 190000, igst: 0, cgst: 17100, sgst: 17100, status: 'Unmatched', reason: 'GSTIN Mismatch' },
  { supplier: 'National Packaging', gstin: '27AABCN4321H1Z7', invoice: 'PUR-0756', date: '01 Jul 2025', value: 145000, igst: 0, cgst: 13050, sgst: 13050, status: 'Suggested', reason: 'Date differs by 2 days' },
  { supplier: 'Excel Logistics', gstin: '27AABCE1234I1Z9', invoice: 'PUR-0543', date: '28 Jun 2025', value: 85000, igst: 7650, cgst: 0, sgst: 0, status: 'Matched' },
  { supplier: 'Sunrise Electricals', gstin: '27AABCS9876J1ZA', invoice: 'PUR-0321', date: '25 Jun 2025', value: 60000, igst: 0, cgst: 5400, sgst: 5400, status: 'Unmatched', reason: 'Invoice not found in books' },
];

// ─── E-Way Bills ───────────────────────────────────────────────────────────
export const ewayBills = [
  { id: 1, ewbNo: '271234567890', date: '10 Jul 2025', party: 'Reliance Retail Ltd.', from: 'Mumbai', to: 'Pune', amount: 980000, mode: 'Road', status: 'Active', validity: '12 Jul 2025', vehicle: 'MH04 CD 5678' },
  { id: 2, ewbNo: '271234567891', date: '09 Jul 2025', party: 'ABC Traders', from: 'Mumbai', to: 'Nashik', amount: 760000, mode: 'Road', status: 'Active', validity: '11 Jul 2025', vehicle: 'MH12 EF 9012' },
  { id: 3, ewbNo: '271234567892', date: '08 Jul 2025', party: 'Tata Consumer', from: 'Mumbai', to: 'Bangalore', amount: 640000, mode: 'Road', status: 'Expiring', validity: '10 Jul 2025', vehicle: 'MH43 GH 3456' },
  { id: 4, ewbNo: '271234567893', date: '07 Jul 2025', party: 'Metro Cash', from: 'Mumbai', to: 'Hyderabad', amount: 520000, mode: 'Road', status: 'Expired', validity: '09 Jul 2025', vehicle: 'MH01 IJ 7890' },
  { id: 5, ewbNo: '271234567894', date: '06 Jul 2025', party: 'D-Mart Ltd.', from: 'Mumbai', to: 'Ahmedabad', amount: 480000, mode: 'Road', status: 'Active', validity: '08 Jul 2025', vehicle: 'MH02 KL 1234' },
  { id: 6, ewbNo: '271234567895', date: '05 Jul 2025', party: 'BigBasket', from: 'Mumbai', to: 'Mumbai', amount: 185000, mode: 'Road', status: 'Cancelled', validity: '07 Jul 2025', vehicle: 'MH03 MN 5678' },
  { id: 7, ewbNo: '271234567896', date: '04 Jul 2025', party: 'Reliance Retail', from: 'Mumbai', to: 'Surat', amount: 320000, mode: 'Road', status: 'Active', validity: '06 Jul 2025', vehicle: 'MH04 OP 9012' },
];

export const ewbPerDay = [
  { day: '1', count: 3 }, { day: '2', count: 5 }, { day: '3', count: 2 }, { day: '4', count: 4 },
  { day: '5', count: 6 }, { day: '6', count: 3 }, { day: '7', count: 5 }, { day: '8', count: 4 },
  { day: '9', count: 7 }, { day: '10', count: 5 }, { day: '11', count: 3 }, { day: '12', count: 6 },
];

// ─── Other Taxes ───────────────────────────────────────────────────────────
export const tdsData = [
  { date: '07 Jul 2025', voucher: 'JV-0098', party: 'ABC Consulting', section: '194J', amount: 18000, challan: 'CHN-2025-0134', status: 'Remitted' },
  { date: '06 Jul 2025', voucher: 'JV-0097', party: 'Excel Logistics', section: '194C', amount: 4250, challan: 'CHN-2025-0133', status: 'Remitted' },
  { date: '05 Jul 2025', voucher: 'JV-0096', party: 'Sunrise Electricals', section: '194C', amount: 3000, challan: '', status: 'Pending' },
  { date: '04 Jul 2025', voucher: 'JV-0095', party: 'National Packaging', section: '194C', amount: 7250, challan: 'CHN-2025-0132', status: 'Remitted' },
  { date: '01 Jul 2025', voucher: 'JV-0090', party: 'IT Services Co.', section: '194J', amount: 9500, challan: '', status: 'Pending' },
];

// ─── Audit Trail ──────────────────────────────────────────────────────────
export const auditTrail = [
  { date: '10 Jul 2025', voucher: 'SI-2025-0782', type: 'Sales Invoice', ledger: 'Reliance Retail', drCr: 'Dr', amount: 1159000, user: 'Rajesh K.', action: 'Created' },
  { date: '09 Jul 2025', voucher: 'PV-0112', type: 'Payment Voucher', ledger: 'HDFC Bank CA', drCr: 'Cr', amount: 75000, user: 'Rajesh K.', action: 'Created' },
  { date: '09 Jul 2025', voucher: 'SI-2025-0781', type: 'Sales Invoice', ledger: 'ABC Traders', drCr: 'Dr', amount: 760000, user: 'Priya M.', action: 'Modified' },
  { date: '08 Jul 2025', voucher: 'PI-2025-0456', type: 'Purchase Invoice', ledger: 'Shree Polymers', drCr: 'Cr', amount: 330400, user: 'Rajesh K.', action: 'Created' },
  { date: '08 Jul 2025', voucher: 'RCP-0045', type: 'Receipt Voucher', ledger: 'Cash in Hand', drCr: 'Dr', amount: 45000, user: 'Priya M.', action: 'Created' },
  { date: '07 Jul 2025', voucher: 'JV-0098', type: 'Journal Voucher', ledger: 'TDS Payable', drCr: 'Cr', amount: 18000, user: 'Rajesh K.', action: 'Created' },
  { date: '07 Jul 2025', voucher: 'EXP-0234', type: 'Expense Voucher', ledger: 'Salary Account', drCr: 'Dr', amount: 380000, user: 'Admin', action: 'Created' },
  { date: '06 Jul 2025', voucher: 'SI-2025-0780', type: 'Sales Invoice', ledger: 'Tata Consumer', drCr: 'Dr', amount: 640000, user: 'Priya M.', action: 'Deleted' },
];

// ─── Ledgers ──────────────────────────────────────────────────────────────
export const ledgerList = [
  { id: 1, name: 'Reliance Retail Ltd.', group: 'Sundry Debtors', opening: 680000, closing: 1159000, type: 'Dr', gstin: '27AABCR0001A1Z3', status: 'Active' },
  { id: 2, name: 'ABC Traders', group: 'Sundry Debtors', opening: 320000, closing: 760000, type: 'Dr', gstin: '27AABCA5678B1Z1', status: 'Active' },
  { id: 3, name: 'Shree Polymers', group: 'Sundry Creditors', opening: 180000, closing: 330400, type: 'Cr', gstin: '27AABCS5678F1Z3', status: 'Active' },
  { id: 4, name: 'HDFC Bank CA', group: 'Bank Accounts', opening: 1200000, closing: 1845000, type: 'Dr', gstin: '', status: 'Active' },
  { id: 5, name: 'Cash in Hand', group: 'Cash in Hand', opening: 232600, closing: 345000, type: 'Dr', gstin: '', status: 'Active' },
  { id: 6, name: 'Sales Account', group: 'Direct Income', opening: 0, closing: 4580000, type: 'Cr', gstin: '', status: 'Active' },
  { id: 7, name: 'Purchase Account', group: 'Direct Expense', opening: 0, closing: 2840000, type: 'Dr', gstin: '', status: 'Active' },
  { id: 8, name: 'Salary & Wages', group: 'Indirect Expense', opening: 0, closing: 380000, type: 'Dr', gstin: '', status: 'Active' },
  { id: 9, name: 'Capital Account', group: 'Capital Account', opening: 12000000, closing: 12000000, type: 'Cr', gstin: '', status: 'Active' },
  { id: 10, name: 'GST Payable', group: 'Duties & Taxes', opening: 145000, closing: 185000, type: 'Cr', gstin: '', status: 'Active' },
];
