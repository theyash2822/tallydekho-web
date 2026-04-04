import { useState } from 'react';
import { FormField, Input, Select, SectionTitle, Textarea } from '../../components/FormField';
import SummaryFooter from '../../components/SummaryFooter';
import { CheckCircle } from 'lucide-react';

const VOUCHER_TYPES = ['Payment', 'Receipt', 'Journal', 'Contra'];

const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'NEFT', 'RTGS'];
const LEDGERS_BANK = ['HDFC Bank CA – 0259', 'ICICI Bank CA – 1147', 'Cash in Hand'];
const LEDGERS_ALL = ['ABC Traders', 'Reliance Retail Ltd.', 'Shree Polymers', 'Salary Account', 'Rent Account', 'HDFC Bank CA', 'ICICI Bank CA', 'Cash in Hand'];

export default function VoucherForm({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [type, setType] = useState('Payment');
  const [amount, setAmount] = useState('');

  const numAmount = parseFloat(amount) || 0;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center border border-[#BBF7D0]">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <p className="text-base font-semibold text-[#1C2B3A]">{type} Voucher Created!</p>
        <p className="text-sm text-[#6B7280]">VCH-2025-{String(Math.floor(Math.random() * 9000) + 1000)}</p>
        <div className="flex gap-3 mt-2">
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#3F5263' }}>Share PDF</button>
          <button onClick={() => setSubmitted(false)} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D9DCE0] text-[#6B7280]">New Voucher</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D9DCE0] text-[#6B7280]">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Voucher type selector */}
      <FormField label="Voucher Type" required>
        <div className="flex gap-2">
          {VOUCHER_TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${type === t ? 'text-white border-transparent' : 'border-[#D9DCE0] text-[#6B7280] hover:border-[#3F5263] hover:text-[#3F5263]'}`}
              style={type === t ? { background: 'linear-gradient(135deg,#3F5263,#526373)' } : {}}>
              {t}
            </button>
          ))}
        </div>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Voucher Number"><Input defaultValue={`VCH-2025-${Math.floor(Math.random() * 9000) + 1000}`} readOnly /></FormField>
        <FormField label="Date" required><Input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></FormField>
      </div>

      {/* Dynamic fields based on voucher type */}
      {(type === 'Payment' || type === 'Receipt') && (
        <>
          <SectionTitle title={type === 'Payment' ? 'Payment Details' : 'Receipt Details'} />
          <div className="grid grid-cols-2 gap-4">
            <FormField label={type === 'Payment' ? 'Pay To (Party / Ledger)' : 'Received From (Party)'} required>
              <Select options={LEDGERS_ALL} placeholder="Search ledger or party" />
            </FormField>
            <FormField label={type === 'Payment' ? 'Pay From (Bank / Cash)' : 'Deposit To (Bank / Cash)'} required>
              <Select options={LEDGERS_BANK} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Payment Mode" required><Select options={PAYMENT_MODES} /></FormField>
            <FormField label="Amount" required>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" prefix="₹" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Reference No" hint="UTR / Cheque No / Transaction ID"><Input placeholder="Optional" /></FormField>
            <FormField label="Bank / Cash Balance (After)"><Input readOnly defaultValue="₹18,45,000" /></FormField>
          </div>
        </>
      )}

      {type === 'Journal' && (
        <>
          <SectionTitle title="Journal Entries" subtitle="Debit and Credit legs" />
          <div className="overflow-x-auto rounded-xl border border-[#D9DCE0]">
            <table className="w-full text-sm">
              <thead className="bg-[#F9F9F9] border-b border-[#D9DCE0]">
                <tr>{['Ledger', 'Dr/Cr', 'Amount (₹)', 'Narration'].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[#6B7280]">{h}</th>)}</tr>
              </thead>
              <tbody>
                {[0, 1].map(i => (
                  <tr key={i} className="border-b border-[#F0EFE9]">
                    <td className="px-3 py-2"><Select options={LEDGERS_ALL} placeholder="Select ledger" /></td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {['Dr', 'Cr'].map(d => (
                          <button key={d} className="px-2.5 py-1 rounded text-xs font-medium border border-[#D9DCE0] hover:border-[#3F5263] hover:text-[#3F5263]">{d}</button>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2"><Input type="number" placeholder="0.00" /></td>
                    <td className="px-3 py-2"><Input placeholder="Brief narration" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {type === 'Contra' && (
        <>
          <SectionTitle title="Contra Entry" subtitle="Transfer between cash and bank accounts" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="From Account" required><Select options={LEDGERS_BANK} /></FormField>
            <FormField label="To Account" required><Select options={LEDGERS_BANK} /></FormField>
          </div>
          <FormField label="Transfer Amount" required>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" prefix="₹" />
          </FormField>
          <FormField label="Reference / Cheque No"><Input placeholder="Optional" /></FormField>
        </>
      )}

      <SectionTitle title="Narration" />
      <Textarea placeholder="Enter narration for this voucher" rows={2} />

      <SummaryFooter
        subtotal={numAmount}
        onSubmit={() => setSubmitted(true)}
        submitLabel={`Submit ${type} Voucher`}
        showDraft={false}
      />
    </div>
  );
}
