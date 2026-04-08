import { useState, useCallback } from 'react';
import { FormField, Input, SectionTitle, Toggle } from '../../components/FormField';
import ItemsTable from '../../components/ItemsTable';
import SummaryFooter from '../../components/SummaryFooter';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchLedgers, createPurchaseOrder } from '../../services/api';
import LiveSearch from '../../components/LiveSearch';

export default function PurchaseOrderForm({ onClose }) {
  const { selectedCompany } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdNumber, setCreatedNumber] = useState('');
  const [isOptional, setIsOptional] = useState(false);
  const [partyLedger, setPartyLedger] = useState('');
  const [salesLedger, setSalesLedger] = useState('Purchase Accounts');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [narration, setNarration] = useState('');
  const [items, setItems] = useState([]);
  const [warehouse, setWarehouse] = useState('');
  const [logistics, setLogistics] = useState([]);

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const taxAmt   = items.reduce((s, i) => s + (parseFloat(i.amount) || 0) * 0.18, 0);

  const fetchParties = useCallback(async (q) => {
    if (!selectedCompany?.guid) return [];
    const res = await fetchLedgers({ companyGuid: selectedCompany.guid, searchText: q, pageSize: 20 });
    return (res?.data?.ledgers || []).map(l => ({ label: l.name, value: l.name, sub: l.parent || '', badge: l.gstin ? 'GST' : '' }));
  }, [selectedCompany?.guid]);

  const fetchSalesLedgers = useCallback(async (q) => {
    if (!selectedCompany?.guid) return [];
    const res = await fetchLedgers({ companyGuid: selectedCompany.guid, searchText: q || 'purchase', pageSize: 15 });
    return (res?.data?.ledgers || [])
      .filter(l => (l.parent || '').toLowerCase().includes('purchase') || (l.name || '').toLowerCase().includes('purchase'))
      .map(l => ({ label: l.name, value: l.name, sub: l.parent || '' }));
  }, [selectedCompany?.guid]);

  const handleSubmit = async () => {
    if (!partyLedger) { setError('Please select a vendor / party'); return; }
    if (!items.length || !items[0]?.name) { setError('Please add at least one item'); return; }
    if (!selectedCompany) { setError('No company selected'); return; }
    setSubmitting(true); setError('');
    try {
      const result = await createPurchaseOrder({
        companyGuid: selectedCompany.guid, companyName: selectedCompany.name,
        date: orderDate.replace(/-/g, ''), partyLedger,
        salesLedger: salesLedger || 'Purchase Accounts',
        items: items.filter(i => i.name).map(i => ({
          itemName: i.name, billedQty: parseFloat(i.qty) || 1,
          rate: parseFloat(i.rate) || 0, amount: parseFloat(i.amount) || 0,
        })),
        narration, reference, isOptional,
      });
      if (result?.status) { setCreatedNumber(result?.voucherNumber || ''); setSubmitted(true); }
      else setError(result?.message || 'Failed to create');
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#EDF3EC] flex items-center justify-center border border-[#B7D4B2]">
          <CheckCircle size={32} className="text-[#0F7B6C]" />
        </div>
        <p className="text-base font-semibold text-[#37352F]">Purchase Order Created in Tally!</p>
        {createdNumber && <p className="text-sm font-mono font-bold text-[#37352F] bg-[#EFEFEF] px-3 py-1 rounded-lg">{createdNumber}</p>}
        <p className="text-sm text-[#787774]">{selectedCompany?.name}</p>
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
        <FormField label="Vendor / Party" required>
          <LiveSearch value={partyLedger} onChange={setPartyLedger} placeholder="Search vendor / party..." fetchFn={fetchParties} />
        </FormField>
        <FormField label="Purchase Ledger" required>
          <LiveSearch value={salesLedger} onChange={setSalesLedger} placeholder="Search purchase ledger..." fetchFn={fetchSalesLedgers} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date" required><Input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} /></FormField>
        <FormField label="Reference No"><Input value={reference} onChange={e => setReference(e.target.value)} placeholder="Optional reference" /></FormField>
      </div>
      <SectionTitle title="Items / Services" subtitle="Add products with qty, rate and tax" />
      <ItemsTable warehouse={warehouse} onWarehouseChange={setWarehouse} onItemsChange={setItems} />
      <SectionTitle title="Narration" />
      <textarea rows={2} value={narration} onChange={e => setNarration(e.target.value)} placeholder="Optional narration" className="notion-input w-full text-sm resize-none" />
      {error && <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-sm text-[#EB5757]"><AlertCircle size={14} />{error}</div>}
      <SummaryFooter subtotal={subtotal} tax={Math.round(taxAmt)} onSubmit={handleSubmit} submitLabel={submitting ? 'Submitting...' : 'Submit to Tally'} showDraft={true} />
    </div>
  );
}
