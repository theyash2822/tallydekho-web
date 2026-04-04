import { useState } from 'react';
import { FormField, Input, Select, SectionTitle, Toggle } from '../../components/FormField';
import ItemsTable from '../../components/ItemsTable';
import LogisticsSection from '../../components/LogisticsSection';
import SummaryFooter from '../../components/SummaryFooter';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function SalesOrderForm({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [isOptional, setIsOptional] = useState(false);
  const [items, setItems] = useState([]);
  const [warehouse, setWarehouse] = useState('');

  const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0);
  const tax = items.reduce((s, i) => s + (i.amount || 0) * 0.18, 0);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center border border-[#BBF7D0]">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <p className="text-base font-semibold text-[#1C2B3A]">Sales Order Created!</p>
        <p className="text-sm text-[#6B7280]">SO-2025-0124</p>
        <div className="flex gap-3 mt-2">
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2" style={{ background: '#3F5263' }}>
            Convert to Invoice <ArrowRight size={13} />
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D9DCE0] text-[#6B7280] hover:bg-[#F4F5F6]">Share PDF</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#D9DCE0] text-[#6B7280] hover:bg-[#F4F5F6]">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Ledger" required>
          <div className="flex gap-2">
            <Select options={['Purchase - Raw Materials', 'Purchase - Finished Goods', 'Expenses', 'Capital Purchase']} placeholder="Select Ledger" />
            <button onClick={() => setIsOptional(p => !p)}
              className={`px-3 py-1.5 text-xs rounded-lg border font-medium flex-shrink-0 transition-colors ${isOptional ? 'bg-[#ECEEEF] text-[#3F5263] border-[#C5CBD0]' : 'border-[#D9DCE0] text-[#6B7280]'}`}>
              {isOptional ? 'Optional' : 'Regular'}
            </button>
          </div>
        </FormField>
        <FormField label="Order Number">
          <Input defaultValue="SO-2025-0124" readOnly />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Order Date" required><Input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></FormField>
        <FormField label="Customer" required>
          <Select options={['ABC Traders', 'Reliance Retail Ltd.', 'Metro Cash & Carry']} placeholder="Search customer" />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="Payment Terms">
          <Select options={['Due on Receipt', '15 Days', '30 Days', 'Custom']} />
        </FormField>
        <FormField label="Due Date"><Input type="date" /></FormField>
        <FormField label="Validity Period" hint="e.g. Valid for 30 days">
          <Input placeholder="30 days" />
        </FormField>
      </div>

      <SectionTitle title="Items / Products" />
      <ItemsTable warehouse={warehouse} onWarehouseChange={setWarehouse} onItemsChange={setItems} />

      <SectionTitle title="Logistics / Shipping" subtitle="Optional at sales order stage" />
      <LogisticsSection />

      <SummaryFooter subtotal={subtotal} tax={Math.round(tax)} onSubmit={() => setSubmitted(true)} submitLabel="Submit Sales Order" showDraft={false} />
    </div>
  );
}
