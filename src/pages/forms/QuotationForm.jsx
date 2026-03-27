import { useState } from 'react';
import { FormField, Input, Select, SectionTitle, Textarea } from '../../components/FormField';
import ItemsTable from '../../components/ItemsTable';
import LogisticsSection from '../../components/LogisticsSection';
import SummaryFooter from '../../components/SummaryFooter';
import { CheckCircle, ArrowRight } from 'lucide-react';

const DEFAULT_TC = [
  'Installation cost will be extra.',
  'Delivery within 7 business days from order confirmation.',
  'Final freight will be confirmed at invoicing.',
  'Loading/Unloading will be taken care by party.',
];

export default function QuotationForm({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [items, setItems] = useState([]);
  const [warehouse, setWarehouse] = useState('');
  const [tc, setTc] = useState(DEFAULT_TC.join('\n'));

  const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0);
  const tax = items.reduce((s, i) => s + (i.amount || 0) * 0.18, 0);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <p className="text-base font-semibold text-[#1A1A1A]">Quotation Created!</p>
        <p className="text-sm text-[#787774]">QT-2025-0056</p>
        <div className="flex gap-3 mt-2">
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2" style={{ background: '#059669' }}>
            Convert to Order <ArrowRight size={13} />
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium border border-[#E8E7E3] text-[#787774]">Share PDF</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#E8E7E3] text-[#787774]">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Quotation Number"><Input defaultValue="QT-2025-0056" readOnly /></FormField>
        <FormField label="Quotation Date" required><Input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Customer" required>
          <Select options={['ABC Traders', 'Reliance Retail Ltd.', 'Metro Cash & Carry', 'D-Mart Ltd.']} placeholder="Search or add customer" />
        </FormField>
        <FormField label="Validity" hint="Days from quotation date">
          <Input placeholder="30" type="number" />
        </FormField>
      </div>

      <SectionTitle title="Quote Items" />
      <ItemsTable warehouse={warehouse} onWarehouseChange={setWarehouse} onItemsChange={setItems} />

      <SectionTitle title="Logistics / Shipping" subtitle="Optional" />
      <LogisticsSection />

      <SectionTitle title="Terms & Conditions" />
      <Textarea value={tc} onChange={e => setTc(e.target.value)} rows={5} placeholder="Enter terms and conditions..." />

      <SummaryFooter subtotal={subtotal} tax={Math.round(tax)} onSubmit={() => setSubmitted(true)} submitLabel="Submit Quotation" showDraft={false} />
    </div>
  );
}
