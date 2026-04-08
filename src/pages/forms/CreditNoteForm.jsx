import { useState, useCallback } from 'react';
import { FormField, Input, SectionTitle, Toggle } from '../../components/FormField';
import ItemsTable from '../../components/ItemsTable';
import SummaryFooter from '../../components/SummaryFooter';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchLedgers, createCreditNote } from '../../services/api';
import LiveSearch from '../../components/LiveSearch';

export default function CreditNoteForm({ onClose }) {
  const { selectedCompany } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdNumber, setCreatedNumber] = useState('');
  const [isOptional, setIsOptional] = useState(false);
  const [partyLedger, setPartyLedger] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [narration, setNarration] = useState('');
  const [items, setItems] = useState([]);
  const [warehouse, setWarehouse] = useState('');

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const taxAmt   = items.reduce((s, i) => s + (parseFloat(i.amount) || 0) * 0.18, 0);

  const fetchParties = useCallback(async (q) => {
    if (!selectedCompany?.guid) return [];
    const res = await fetchLedgers({ companyGuid: selectedCompany.guid, searchText: q, pageSize: 20 });
    return (res?.data?.ledgers || []).map(l => ({ label: l.name, value: l.name, sub: l.parent || '', badge: l.gstin ? 'GST' : '' }));
  }, [selectedCompany?.guid]);

  const handleSubmit = async () => {
    if (!partyLedger) { setError('Please select a customer / party'); return; }
    if (!selectedCompany) { setError('No company selected'); return; }
    setSubmitting(true); setError('');
    try {
      const result = await createCreditNote({
        companyGuid: selectedCompany.guid, companyName: selectedCompany.name,
        date: date.replace(/-/g, ''), partyLedger,
        amount: subtotal,
        items: items.filter(i => i.name).map(i => ({ itemName: i.name, billedQty: parseFloat(i.qty)||1, rate: parseFloat(i.rate)||0, amount: parseFloat(i.amount)||0 })),
        narration, reference, isOptional,
      });
      if (result?.status) { setCreatedNumber(result?.voucherNumber || ''); setSubmitted(true); }
      else setError(result?.message || 'Failed');
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#EDF3EC] flex items-center justify-center border border-[#B7D4B2]">
          <CheckCircle size={32} className="text-[#0F7B6C]" />
        </div>
        <p className="text-base font-semibold text-[#37352F]">Credit Note Created in Tally!</p>
        {createdNumber && <p className="text-sm font-mono font-bold text-[#37352F] bg-[#EFEFEF] px-3 py-1 rounded-lg">{createdNumber}</p>}
        <div className="flex gap-3 mt-2">
          <button onClick={() => { setSubmitted(false); setPartyLedger(''); setItems([]); }} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D3D1CB] text-[#787774] hover:bg-[#F7F7F5]">Create Another</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D3D1CB] text-[#787774] hover:bg-[#F7F7F5]">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Toggle label="Optional Entry" value={isOptional} onChange={setIsOptional} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Customer / Party" required>
          <LiveSearch value={partyLedger} onChange={setPartyLedger} placeholder="Search customer / party..." fetchFn={fetchParties} />
        </FormField>
        <FormField label="Reference / Original Invoice">
          <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="e.g. SI-2025-001" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date" required><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></FormField>
      </div>
      <SectionTitle title="Items / Services" subtitle="Products being returned / noted" />
      <ItemsTable warehouse={warehouse} onWarehouseChange={setWarehouse} onItemsChange={setItems} />
      <SectionTitle title="Narration" />
      <textarea rows={2} value={narration} onChange={e => setNarration(e.target.value)} placeholder="Reason for credit note" className="notion-input w-full text-sm resize-none" />
      {error && <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-sm text-[#EB5757]"><AlertCircle size={14} />{error}</div>}
      <SummaryFooter subtotal={subtotal} tax={Math.round(taxAmt)} onSubmit={handleSubmit} submitLabel={submitting ? 'Submitting...' : 'Submit to Tally'} showDraft={true} />
    </div>
  );
}
