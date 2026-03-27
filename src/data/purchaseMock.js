export const purchaseInvoices = [
  { id:1, ref:'PI-2025-0456', vendor:'Shree Polymers',     gstin:'27AABCS5678F1Z3', date:'08 Jul 2025', amount:330400, status:'Paid',    mode:'Bank',   received:'Complete' },
  { id:2, ref:'PI-2025-0455', vendor:'Bharat Chemicals',   gstin:'27AABCB9876G1Z5', date:'06 Jul 2025', amount:228100, status:'Unpaid',  mode:'Credit', received:'Complete' },
  { id:3, ref:'PI-2025-0454', vendor:'National Packaging', gstin:'27AABCN4321H1Z7', date:'05 Jul 2025', amount:173450, status:'Partial', mode:'Bank',   received:'Partial'  },
  { id:4, ref:'PI-2025-0453', vendor:'Excel Logistics',    gstin:'27AABCE1234I1Z9', date:'04 Jul 2025', amount:100300, status:'Paid',    mode:'Cash',   received:'Complete' },
  { id:5, ref:'PI-2025-0452', vendor:'Sunrise Electricals',gstin:'27AABCS9876J1ZA', date:'03 Jul 2025', amount:72600,  status:'Unpaid',  mode:'Credit', received:'Pending'  },
  { id:6, ref:'PI-2025-0451', vendor:'Allied Industries',  gstin:'27AABCA2222K1Z3', date:'01 Jul 2025', amount:185000, status:'Paid',    mode:'Bank',   received:'Complete' },
];

export const purchaseOrders = [
  { id:1, ref:'PO-2025-0089', vendor:'Shree Polymers',     date:'07 Jul 2025', amount:420000, status:'Open',           expectedDate:'14 Jul 2025' },
  { id:2, ref:'PO-2025-0088', vendor:'Bharat Chemicals',   date:'05 Jul 2025', amount:190000, status:'Partial',        expectedDate:'12 Jul 2025' },
  { id:3, ref:'PO-2025-0087', vendor:'National Packaging', date:'03 Jul 2025', amount:145000, status:'Fully Received', expectedDate:'10 Jul 2025' },
  { id:4, ref:'PO-2025-0086', vendor:'Excel Logistics',    date:'01 Jul 2025', amount:85000,  status:'Closed',         expectedDate:'08 Jul 2025' },
];

export const purchaseKPIs = {
  total: 2840000, tax: 340800, avgInvoice: 473400, count: 6,
  paid: 3, unpaid: 3,
};
