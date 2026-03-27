export const expenses = [
  { id:1, date:'10 Jul 2025', voucher:'EXP-0245', category:'Salary & Wages',  ledger:'Salary Account',   amount:380000, tax:0,     status:'Paid',   mode:'Bank',   attachment:false },
  { id:2, date:'09 Jul 2025', voucher:'EXP-0244', category:'Office Rent',     ledger:'Rent Account',     amount:75000,  tax:0,     status:'Paid',   mode:'Bank',   attachment:true  },
  { id:3, date:'08 Jul 2025', voucher:'EXP-0243', category:'Electricity',     ledger:'Electricity A/c',  amount:32000,  tax:5760,  status:'Paid',   mode:'Bank',   attachment:true  },
  { id:4, date:'07 Jul 2025', voucher:'EXP-0242', category:'Telephone',       ledger:'Telephone A/c',    amount:8500,   tax:1530,  status:'Paid',   mode:'Cash',   attachment:false },
  { id:5, date:'06 Jul 2025', voucher:'EXP-0241', category:'Transport',       ledger:'Freight Outward',  amount:22000,  tax:2640,  status:'Unpaid', mode:'Credit', attachment:false },
  { id:6, date:'05 Jul 2025', voucher:'EXP-0240', category:'Repairs',         ledger:'Repairs A/c',      amount:15000,  tax:2700,  status:'Paid',   mode:'Cash',   attachment:true  },
  { id:7, date:'04 Jul 2025', voucher:'EXP-0239', category:'Office Supplies', ledger:'Stationery A/c',   amount:5400,   tax:972,   status:'Paid',   mode:'Cash',   attachment:false },
  { id:8, date:'03 Jul 2025', voucher:'EXP-0238', category:'Bank Charges',    ledger:'Bank Charges A/c', amount:2800,   tax:504,   status:'Paid',   mode:'Bank',   attachment:false },
];

export const expenseCategories = [
  { name:'Salary & Wages', amount:380000, pct:29.8 },
  { name:'Office Rent',    amount:75000,  pct:5.9  },
  { name:'Electricity',    amount:32000,  pct:2.5  },
  { name:'Transport',      amount:22000,  pct:1.7  },
  { name:'Others',         amount:51700,  pct:4.1  },
];

export const expenseKPIs = { total:560700, tax:14106, paid:5, unpaid:1, categories:5 };
