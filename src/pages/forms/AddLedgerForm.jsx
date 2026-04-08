import { useState } from 'react';
import { FormField, Input, Select, SectionTitle, Toggle } from '../../components/FormField';
import { CheckCircle } from 'lucide-react';
import { addToQueue } from '../../services/localQueue';

const GROUPS = [
  'Sundry Debtors', 'Sundry Creditors', 'Bank Accounts', 'Cash in Hand',
  'Direct Income', 'Indirect Income', 'Direct Expense', 'Indirect Expense',
  'Capital Account', 'Duties & Taxes', 'Loans (Liability)', 'Fixed Assets',
  'Current Assets', 'Current Liabilities', 'Investments', 'Reserves & Surplus',
];

const REG_TYPES = ['Regular', 'Composition', 'Unregistered', 'Consumer', 'Overseas'];

export default function AddLedgerForm({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [hasGST, setHasGST] = useState(false);
  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [form, setForm] = useState({
    name: '', group: 'Sundry Debtors', alias: '', phone: '', email: '',
    address: '', gstin: '', regType: 'Regular', pan: '',
    bankName: '', accountNo: '', ifsc: '', branch: '',
    openingBalance: '', openingType: 'Dr', narration: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Ledger name is required';
    if (!form.group) e.group = 'Group is required';
    if (hasGST && form.gstin && form.gstin.length !== 15) e.gstin = 'GSTIN must be 15 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    addToQueue('add_ledger', { ...form, hasGST, hasBankDetails, createdAt: new Date().toISOString() });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#ECEEEF] flex items-center justify-center border border-[#C5CBD0]">
          <CheckCircle size={32} style={{ color: '#1C2B3A' }} />
        </div>
        <p className="text-base font-semibold text-[#1C2B3A]">Ledger Created!</p>
        <p className="text-sm text-[#787774]">{form.name} · {form.group}</p>
        <p className="text-xs text-[#AEACA8]">Will sync to Tally on next desktop sync</p>
        <div className="flex gap-3 mt-2">
          <button onClick={() => { setSubmitted(false); setForm({ name:'',group:'Sundry Debtors',alias:'',phone:'',email:'',address:'',gstin:'',regType:'Regular',pan:'',bankName:'',accountNo:'',ifsc:'',branch:'',openingBalance:'',openingType:'Dr',narration:'' }); }}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D4D3CE] text-[#787774] hover:bg-[#F5F4EF]">
            Add Another
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#1C2B3A' }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Basic Info */}
      <SectionTitle title="Basic Information" />
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FormField label="Ledger Name" required>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. ABC Traders, HDFC Bank CA" />
            {errors.name && <p className="text-xs text-[#C0392B] mt-1">{errors.name}</p>}
          </FormField>
        </div>
        <FormField label="Group" required>
          <Select options={GROUPS} value={form.group} onChange={e => set('group', e.target.value)} />
          {errors.group && <p className="text-xs text-[#C0392B] mt-1">{errors.group}</p>}
        </FormField>
        <FormField label="Alias / Short Name" hint="Optional alternate name">
          <Input value={form.alias} onChange={e => set('alias', e.target.value)} placeholder="Optional" />
        </FormField>
      </div>

      {/* Contact */}
      <SectionTitle title="Contact Details" subtitle="Optional" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Phone"><Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98200 00000" /></FormField>
        <FormField label="Email"><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@company.com" /></FormField>
        <div className="col-span-2">
          <FormField label="Address"><Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" /></FormField>
        </div>
      </div>

      {/* GST */}
      <SectionTitle title="GST Details" />
      <Toggle label="This ledger has GST registration" checked={hasGST} onChange={setHasGST} />
      {hasGST && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-[#F5F4EF] rounded-xl border border-[#D4D3CE]">
          <FormField label="GSTIN" hint="15-character GST number">
            <Input value={form.gstin} onChange={e => set('gstin', e.target.value.toUpperCase())} placeholder="27AABCM1234F1Z5" />
            {errors.gstin && <p className="text-xs text-[#C0392B] mt-1">{errors.gstin}</p>}
          </FormField>
          <FormField label="Registration Type">
            <Select options={REG_TYPES} value={form.regType} onChange={e => set('regType', e.target.value)} />
          </FormField>
          <FormField label="PAN"><Input value={form.pan} onChange={e => set('pan', e.target.value.toUpperCase())} placeholder="AABCM1234F" /></FormField>
        </div>
      )}

      {/* Bank Details */}
      <SectionTitle title="Bank Details" />
      <Toggle label="Add bank account details" checked={hasBankDetails} onChange={setHasBankDetails} />
      {hasBankDetails && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-[#F5F4EF] rounded-xl border border-[#D4D3CE]">
          <FormField label="Bank Name"><Input value={form.bankName} onChange={e => set('bankName', e.target.value)} placeholder="HDFC Bank" /></FormField>
          <FormField label="Account Number"><Input value={form.accountNo} onChange={e => set('accountNo', e.target.value)} placeholder="00001234567890" /></FormField>
          <FormField label="IFSC Code"><Input value={form.ifsc} onChange={e => set('ifsc', e.target.value.toUpperCase())} placeholder="HDFC0001234" /></FormField>
          <FormField label="Branch"><Input value={form.branch} onChange={e => set('branch', e.target.value)} placeholder="Nariman Point" /></FormField>
        </div>
      )}

      {/* Opening Balance */}
      <SectionTitle title="Opening Balance" subtitle="As of start of FY 2025-26" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Opening Balance">
          <Input type="number" value={form.openingBalance} onChange={e => set('openingBalance', e.target.value)} placeholder="0.00" prefix="₹" />
        </FormField>
        <FormField label="Balance Type">
          <div className="flex gap-2">
            {['Dr', 'Cr'].map(t => (
              <button key={t} onClick={() => set('openingType', t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${form.openingType === t ? 'text-white border-transparent' : 'border-[#D4D3CE] text-[#787774]'}`}
                style={form.openingType === t ? { background: '#1C2B3A' } : {}}>
                {t === 'Dr' ? 'Debit (Dr)' : 'Credit (Cr)'}
              </button>
            ))}
          </div>
        </FormField>
      </div>

      {/* Narration */}
      <SectionTitle title="Narration" />
      <textarea rows={2} value={form.narration} onChange={e => set('narration', e.target.value)}
        placeholder="Internal notes (optional)" className="notion-input w-full text-sm resize-none" />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90" style={{ background: '#1C2B3A' }}>
          Create Ledger
        </button>
        <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium border border-[#D4D3CE] text-[#787774] hover:bg-[#F5F4EF]">
          Cancel
        </button>
      </div>
    </div>
  );
}
