export const payments = [
  { id:1, date:'10 Jul 2025', voucher:'PV-0118', party:'Shree Polymers',    ledger:'HDFC Bank CA', amount:330400, mode:'NEFT',   ref:'NEFT202507101234', status:'Cleared' },
  { id:2, date:'09 Jul 2025', voucher:'PV-0117', party:'Office Rent',       ledger:'HDFC Bank CA', amount:75000,  mode:'Cheque', ref:'CHQ002981',         status:'Cleared' },
  { id:3, date:'08 Jul 2025', voucher:'PV-0116', party:'Bharat Chemicals',  ledger:'ICICI Bank CA', amount:228100,mode:'RTGS',   ref:'RTGS202507080987', status:'Cleared' },
  { id:4, date:'06 Jul 2025', voucher:'PV-0115', party:'Salary Account',    ledger:'HDFC Bank CA', amount:380000, mode:'NEFT',   ref:'NEFT202507060011', status:'Cleared' },
  { id:5, date:'05 Jul 2025', voucher:'PV-0114', party:'Insurance Premium', ledger:'HDFC Bank CA', amount:18500,  mode:'UPI',    ref:'UPI20250705ABC',    status:'Pending' },
  { id:6, date:'04 Jul 2025', voucher:'PV-0113', party:'Excel Logistics',   ledger:'Cash in Hand', amount:10000,  mode:'Cash',   ref:'',                  status:'Cleared' },
];

export const receipts = [
  { id:1, date:'10 Jul 2025', voucher:'RCV-0045', party:'Reliance Retail Ltd.', ledger:'HDFC Bank CA', amount:980000,  mode:'NEFT',   ref:'NEFT202507101111', status:'Cleared' },
  { id:2, date:'08 Jul 2025', voucher:'RCV-0044', party:'ABC Traders',          ledger:'HDFC Bank CA', amount:250000,  mode:'UPI',    ref:'UPI20250708XYZ',   status:'Cleared' },
  { id:3, date:'06 Jul 2025', voucher:'RCV-0043', party:'Tata Consumer',        ledger:'HDFC Bank CA', amount:640000,  mode:'NEFT',   ref:'NEFT202507061111', status:'Cleared' },
  { id:4, date:'05 Jul 2025', voucher:'RCV-0042', party:'Metro Cash & Carry',   ledger:'HDFC Bank CA', amount:520000,  mode:'RTGS',   ref:'RTGS20250705999',  status:'Cleared' },
  { id:5, date:'03 Jul 2025', voucher:'RCV-0041', party:'D-Mart Ltd.',          ledger:'Cash in Hand', amount:45000,   mode:'Cash',   ref:'',                  status:'Cleared' },
  { id:6, date:'02 Jul 2025', voucher:'RCV-0040', party:'BigBasket',            ledger:'ICICI Bank CA', amount:185000, mode:'NEFT',   ref:'NEFT202507020022', status:'Cleared' },
];

export const paymentKPIs = { totalPayments:1042000, totalReceipts:2620000, pendingPayments:18500, pendingReceipts:0 };
