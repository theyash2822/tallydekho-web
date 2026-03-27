export const salesInvoices = [
  { id:1,  ref:'SI-2025-0782', customer:'Reliance Retail Ltd.',  gstin:'27AABCR0001A1Z3', date:'10 Jul 2025', amount:1159000, status:'Paid',      irn:'generated', ewb:'active',    mode:'Credit' },
  { id:2,  ref:'SI-2025-0781', customer:'ABC Traders',           gstin:'27AABCA5678B1Z1', date:'09 Jul 2025', amount:760000,  status:'Unpaid',    irn:'pending',   ewb:'none',      mode:'Credit' },
  { id:3,  ref:'SI-2025-0780', customer:'Tata Consumer Products',gstin:'27AADCT1234C1Z5', date:'08 Jul 2025', amount:640000,  status:'Partial',   irn:'error',     ewb:'generated', mode:'Credit' },
  { id:4,  ref:'SI-2025-0779', customer:'Metro Cash & Carry',    gstin:'27AABCM9876D1Z7', date:'07 Jul 2025', amount:520000,  status:'Paid',      irn:'generated', ewb:'expiring',  mode:'Cash'   },
  { id:5,  ref:'SI-2025-0778', customer:'D-Mart Ltd.',           gstin:'27AABCD4321E1Z9', date:'06 Jul 2025', amount:480000,  status:'Unpaid',    irn:'generated', ewb:'none',      mode:'Credit' },
  { id:6,  ref:'SI-2025-0777', customer:'BigBasket',             gstin:'27AABCB1111F1Z2', date:'05 Jul 2025', amount:185000,  status:'Paid',      irn:'generated', ewb:'cancelled', mode:'Bank'   },
  { id:7,  ref:'SI-2025-0776', customer:'Reliance Retail Ltd.',  gstin:'27AABCR0001A1Z3', date:'04 Jul 2025', amount:320000,  status:'Paid',      irn:'generated', ewb:'active',    mode:'Bank'   },
  { id:8,  ref:'SI-2025-0775', customer:'Future Retail',         gstin:'27AABCF5555G1Z8', date:'03 Jul 2025', amount:215000,  status:'Unpaid',    irn:'none',      ewb:'none',      mode:'Credit' },
];

export const salesOrders = [
  { id:1, ref:'SO-2025-0124', customer:'Reliance Retail Ltd.', date:'08 Jul 2025', amount:980000,  status:'Open',             dueDate:'15 Jul 2025' },
  { id:2, ref:'SO-2025-0123', customer:'ABC Traders',          date:'06 Jul 2025', amount:760000,  status:'Partially Invoiced',dueDate:'13 Jul 2025' },
  { id:3, ref:'SO-2025-0122', customer:'Metro Cash & Carry',   date:'05 Jul 2025', amount:420000,  status:'Fully Invoiced',   dueDate:'12 Jul 2025' },
  { id:4, ref:'SO-2025-0121', customer:'D-Mart Ltd.',          date:'03 Jul 2025', amount:350000,  status:'Closed',           dueDate:'10 Jul 2025' },
];

export const quotations = [
  { id:1, ref:'QT-2025-0056', customer:'Future Retail',  date:'09 Jul 2025', amount:520000, status:'Open',      validity:'23 Jul 2025' },
  { id:2, ref:'QT-2025-0055', customer:'BigBasket',      date:'07 Jul 2025', amount:185000, status:'Converted', validity:'21 Jul 2025' },
  { id:3, ref:'QT-2025-0054', customer:'ABC Traders',    date:'04 Jul 2025', amount:340000, status:'Expired',   validity:'04 Jul 2025' },
  { id:4, ref:'QT-2025-0053', customer:'Metro Cash',     date:'01 Jul 2025', amount:210000, status:'Lost',      validity:'15 Jul 2025' },
];

export const salesKPIs = {
  total: 4580000, tax: 548160, avgInvoice: 572500, count: 8,
  paid: 5, unpaid: 3, partial: 0,
};
