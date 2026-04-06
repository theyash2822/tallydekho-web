import { useState } from 'react';
import { FormField, Input, Select, SectionTitle, Textarea } from '../../components/FormField';
import SummaryFooter from '../../components/SummaryFooter';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createPaymentVoucher, createReceiptVoucher, createJournalVoucher, createContraVoucher } from '../../services/api';

const VOUCHER_TYPES = ['Payment', 'Receipt', 'Journal', 'Contra'];

export default function VoucherForm({ onClose }) {
  const { selectedCompany } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdNumber, setCreatedNumber] = useState('');
  const [type, setType] = useState('Payment');
  const [isOptional, setIsOptional] = useState(false);

  // Common fields
  const [partyLedger, setPartyLedger] = useState('');
  const [bankLedger, setBankLedger] = useState('');
  const [drLedger, setDrLedger] = useState('');
  const [crLedger, setCrLedger] = useState('');
  const [fromLedger, setFromLedger] = useState('');
  const [toLedger, setToLedger] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [narration, setNarration] = useState('');
  const [reference, setReference] = useState('');

  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = async () => {
    if (!selectedCompany) { setError('No company selected'); return; }
    if (!numAmount) { setError('Please enter an amount'); return; }

    setError('');
    setSubmitting(true);

    try {
      const base = {
        companyGuid: selectedCompany.guid,
        companyName: selectedCompany.name,
        date: date.replace(/-/g, ''),
        narration,
        reference,
        amount: numAmount,
        isOptional,
      };

      let result;
      if (type === 'Payment') {
        if (!partyLedger || !bankLedger) { setError('Party and bank/cash ledger required'); setSubmitting(false); return; }
        result = await createPaymentVoucher({ ...base, partyLedger, bankLedger });
      } else if (type === 'Receipt') {
        if (!partyLedger || !bankLedger) { setError('Party and bank/cash ledger required'); setSubmitting(false); return; }
        result = await createReceiptVoucher({ ...base, partyLedger, bankLedger });
      } else if (type === 'Journal') {
        if (!drLedger || !crLedger) { setError('Dr and Cr ledger required'); setSubmitting(false); return; }
        result = await createJournalVoucher({ ...base, drLedger, crLedger });
      } else if (type === 'Contra') {
        if (!fromLedger || !toLedger) { setError('From and To ledger required'); setSubmitting(false); return; }
        result = await createContraVoucher({ ...base, fromLedger, toLedger });
      }

      if (result?.status) {
        // Voucher number from backend (parsed from Tally XML by desktop)
        setCreatedNumber(result?.voucherNumber || '');
        setSubmitted(true);
      } else {
        setError(result?.message || 'Failed to create voucher in Tally');
      }
    } catch (e) {
      setError(e.message || 'Failed to connect to Tally');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#E8F5ED] flex items-center justify-center border border-[#A8D5BC]">
          <CheckCircle size={32} className="text-[#2D7D46]" />
        </div>
        <p className="text-base font-semibold text-[#1C2B3A]">{type} Voucher Created in Tally!</p>
        {createdNumber && (
          <p className="text-sm font-mono font-bold text-[#3F5263] bg-[#ECEEEF] px-3 py-1 rounded-lg">
            {createdNumber}
          </p>
        )}
        <p className="text-sm text-[#6B7280]">{selectedCompany?.name} · ₹{numAmount.toLocaleString('en-IN')}</p>
        <p className="text-xs text-[#9CA3AF]">{isOptional ? 'Saved as optional entry' : 'Posted to Tally books'}</p>
        <div className="flex gap-3 mt-2">
          <button onClick={() => { setSubmitted(false); setAmount(''); setPartyLedger(''); setBankLedger(''); }}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D9DCE0] text-[#6B7280] hover:bg-[#F4F5F6]">
            New Voucher
          </button>
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#3F5263] hover:bg-[#526373] transition-colors">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Company + Optional */}
      <div className="flex items-center justify-between p-3 bg-[#F4F5F6] rounded-xl border border-[#D9DCE0]">
        <div>
          <p className="text-xs text-[#9CA3AF]">Company</p>
          <p className="text-sm font-semibold text-[#1C2B3A]">{selectedCompany?.name || 'No company selected'}</p>
        </div>
        <button onClick={() => setIsOptional(p => !p)}
          className={`px-3 py-1.5 text-xs rounded-lg border font-semibold transition-colors ${
            isOptional ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]' : 'bg-[#F0FDF4] text-[#2D7D46] border-[#BBF7D0]'
          }`}>
          {isOptional ? 'Optional Entry' : 'Regular Entry'}
        </button>
      </div>

      {/* Voucher type */}
      <FormField label="Voucher Type" required>
        <div className="flex gap-2">
          {VOUCHER_TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                type === t ? 'bg-[#3F5263] text-white border-transparent' : 'border-[#D9DCE0] text-[#6B7280] hover:border-[#3F5263]'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date" required>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </FormField>
        <FormField label="Amount (₹)" required>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" prefix="₹" />
        </FormField>
      </div>

      {/* Payment / Receipt */}
      {(type === 'Payment' || type === 'Receipt') && (
        <div className="grid grid-cols-1 gap-4">
          <FormField label={type === 'Payment' ? 'Pay To (Party)' : 'Receive From (Party)'} required>
            <Input value={partyLedger} onChange={e => setPartyLedger(e.target.value)}
              placeholder="Party name exactly as in Tally" />
          </FormField>
          <FormField label={type === 'Payment' ? 'Pay From (Bank/Cash)' : 'Deposit To (Bank/Cash)'} required>
            <Input value={bankLedger} onChange={e => setBankLedger(e.target.value)}
              placeholder="e.g. HDFC Bank A/C or Cash" />
          </FormField>
        </div>
      )}

      {/* Journal */}
      {type === 'Journal' && (
        <div className="grid grid-cols-1 gap-4">
          <FormField label="Debit Ledger (Dr)" required>
            <Input value={drLedger} onChange={e => setDrLedger(e.target.value)} placeholder="Ledger to debit" />
          </FormField>
          <FormField label="Credit Ledger (Cr)" required>
            <Input value={crLedger} onChange={e => setCrLedger(e.target.value)} placeholder="Ledger to credit" />
          </FormField>
        </div>
      )}

      {/* Contra */}
      {type === 'Contra' && (
        <div className="grid grid-cols-1 gap-4">
          <FormField label="Transfer From" required>
            <Input value={fromLedger} onChange={e => setFromLedger(e.target.value)} placeholder="e.g. Cash in Hand" />
          </FormField>
          <FormField label="Transfer To" required>
            <Input value={toLedger} onChange={e => setToLedger(e.target.value)} placeholder="e.g. HDFC Bank A/C" />
          </FormField>
        </div>
      )}

      <FormField label="Narration">
        <Input value={narration} onChange={e => setNarration(e.target.value)} placeholder="Optional narration" />
      </FormField>
      <FormField label="Reference">
        <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="Cheque no / UTR / Reference" />
      </FormField>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-sm text-[#C0392B]">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <SummaryFooter
        subtotal={numAmount}
        onSubmit={handleSubmit}
        onDraft={() => { setIsOptional(true); handleSubmit(); }}
        submitLabel={submitting ? 'Submitting...' : `Submit ${type} to Tally`}
        showDraft={true}
      />
    </div>
  );
}
