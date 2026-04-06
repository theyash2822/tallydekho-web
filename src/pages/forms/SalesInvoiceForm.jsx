import { useState } from 'react';
import { FormField, Input, Select, SectionTitle, Toggle } from '../../components/FormField';
import ItemsTable from '../../components/ItemsTable';
import LogisticsSection from '../../components/LogisticsSection';
import SummaryFooter from '../../components/SummaryFooter';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createSalesInvoice } from '../../services/api';

const PAYMENT_TERMS = ['Paid / Due on Receipt', '15 Days', '30 Days', 'Custom'];

export default function SalesInvoiceForm({ onClose }) {
  const { selectedCompany } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isOptional, setIsOptional] = useState(false);

  // Form fields
  const [partyLedger, setPartyLedger] = useState('');
  const [salesLedger, setSalesLedger] = useState('Sales Account');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [narration, setNarration] = useState('');
  const [reference, setReference] = useState('');

  // Items and logistics
  const [items, setItems] = useState([]);
  const [warehouse, setWarehouse] = useState('Main Location');
  const [logistics, setLogistics] = useState([]);

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const taxAmt   = items.reduce((s, i) => s + (parseFloat(i.amount) || 0) * ((parseFloat(i.tax) / 100) || 0), 0);
  const logTotal = logistics.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
  const total    = subtotal + taxAmt + logTotal;

  const handleSubmit = async () => {
    if (!partyLedger) { setError('Please select a customer / party'); return; }
    if (items.length === 0 || !items[0]?.name) { setError('Please add at least one item'); return; }
    if (!selectedCompany) { setError('No company selected'); return; }

    setError('');
    setSubmitting(true);

    try {
      const payload = {
        companyGuid: selectedCompany.guid,
        companyName: selectedCompany.name,
        date: invoiceDate.replace(/-/g, ''),
        narration,
        reference,
        partyLedger,
        totalAmount: -total, // negative for party Dr
        isOptional,
        items: items.filter(i => i.name).map(i => ({
          itemName: i.name,
          actualQty: i.qty,
          billedQty: i.qty,
          rate: i.rate,
          amount: i.amount,
          salesLedger,
          godown: warehouse || 'Main Location',
        })),
        taxes: taxAmt > 0 ? [{ ledgerName: 'Output GST', taxAmount: taxAmt, taxableValue: subtotal }] : [],
        logistics: logistics.filter(l => l.amount > 0).map(l => ({ ledgerName: l.type || 'Freight', amount: l.amount })),
      };

      const result = await createSalesInvoice(payload);
      if (result?.status) {
        setSubmitted(true);
      } else {
        setError(result?.message || 'Failed to create invoice in Tally');
      }
    } catch (e) {
      setError(e.message || 'Failed to connect to Tally');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDraft = async () => {
    setIsOptional(true);
    await handleSubmit();
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#E8F5ED] flex items-center justify-center border border-[#A8D5BC]">
          <CheckCircle size={32} className="text-[#2D7D46]" />
        </div>
        <p className="text-base font-semibold text-[#1C2B3A]">
          {isOptional ? 'Optional Entry Saved in Tally!' : 'Sales Invoice Created in Tally!'}
        </p>
        <p className="text-sm text-[#6B7280]">{selectedCompany?.name} · ₹{total.toLocaleString('en-IN')}</p>
        <p className="text-xs text-[#9CA3AF]">{isOptional ? 'Saved as optional entry — will not affect books until approved' : 'Entry posted to Tally books'}</p>
        <div className="flex gap-3 mt-2">
          <button onClick={() => { setSubmitted(false); setPartyLedger(''); setItems([]); setNarration(''); }}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D9DCE0] text-[#6B7280] hover:bg-[#F4F5F6]">
            Create Another
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
      {/* Company + Optional toggle */}
      <div className="flex items-center justify-between p-3 bg-[#F4F5F6] rounded-xl border border-[#D9DCE0]">
        <div>
          <p className="text-xs text-[#9CA3AF]">Company</p>
          <p className="text-sm font-semibold text-[#1C2B3A]">{selectedCompany?.name || 'No company selected'}</p>
        </div>
        <button
          onClick={() => setIsOptional(p => !p)}
          className={`px-3 py-1.5 text-xs rounded-lg border font-semibold transition-colors ${
            isOptional ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]' : 'bg-[#F0FDF4] text-[#2D7D46] border-[#BBF7D0]'
          }`}
        >
          {isOptional ? 'Optional Entry' : 'Regular Entry'}
        </button>
      </div>
      {isOptional && (
        <p className="text-xs text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-3 py-2">
          Optional entry — saved in Tally but does NOT affect books until you convert it to regular.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Customer / Party" required>
          <Input value={partyLedger} onChange={e => setPartyLedger(e.target.value)} placeholder="Type party name exactly as in Tally" />
        </FormField>
        <FormField label="Sales Ledger" required>
          <Input value={salesLedger} onChange={e => setSalesLedger(e.target.value)} placeholder="e.g. Sales Account" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Invoice Date" required>
          <Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
        </FormField>
        <FormField label="Reference No">
          <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="PO/SO reference" />
        </FormField>
      </div>

      <SectionTitle title="Items / Services" subtitle="Add products with qty, rate and tax" />
      <ItemsTable warehouse={warehouse} onWarehouseChange={setWarehouse} onItemsChange={setItems} />

      <SectionTitle title="Logistics / Shipping" subtitle="Optional" />
      <LogisticsSection onLogisticsChange={setLogistics} />

      <SectionTitle title="Narration" />
      <textarea rows={2} value={narration} onChange={e => setNarration(e.target.value)}
        placeholder="Optional narration for this invoice"
        className="notion-input w-full text-sm resize-none" />

      {error && (
        <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-sm text-[#C0392B]">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <SummaryFooter
        subtotal={subtotal}
        tax={Math.round(taxAmt)}
        logistics={logTotal}
        onSubmit={handleSubmit}
        onDraft={handleDraft}
        submitLabel={submitting ? 'Submitting...' : 'Submit to Tally'}
        showDraft={true}
      />
    </div>
  );
}
