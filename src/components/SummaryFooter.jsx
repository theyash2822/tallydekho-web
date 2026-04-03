import { addToQueue } from '../services/localQueue';

const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');

export default function SummaryFooter({ subtotal = 0, discount = 0, tax = 0, logistics = 0, onSubmit, onDraft, submitLabel = 'Submit', showDraft = true, formType = 'entry', formData = {} }) {
  const grand = subtotal - discount + tax + logistics;

  const handleSubmit = () => {
    // Save to local queue (offline-first, same as mobile pattern)
    addToQueue(formType, { ...formData, subtotal, tax, logistics, grand, submittedAt: new Date().toISOString() });
    onSubmit && onSubmit();
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-[#E8E7E3]" style={{ marginLeft: -24, marginRight: -24, paddingLeft: 24, paddingRight: 24 }}>
      {/* Summary */}
      <div className="py-3 bg-[#FBFAF8] border-b border-[#E8E7E3]" style={{ marginLeft: -24, marginRight: -24, paddingLeft: 24, paddingRight: 24 }}>
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[#787774]">Subtotal</span>
            <span className="font-medium text-[#1A1A1A]">{fmt(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[#787774]">Discount</span>
              <span className="font-medium text-rose-500">-{fmt(discount)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[#787774]">Tax</span>
            <span className="font-medium text-[#1A1A1A]">{fmt(tax)}</span>
          </div>
          {logistics > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[#787774]">Logistics</span>
              <span className="font-medium text-[#1A1A1A]">{fmt(logistics)}</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[#787774] font-medium">Grand Total</span>
            <span className="text-lg font-bold text-[#1A1A1A]">{fmt(grand)}</span>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="py-3 flex items-center justify-between">
        <button className="text-sm text-[#787774] hover:text-[#1A1A1A] transition-colors">Cancel</button>
        <div className="flex gap-2">
          {showDraft && (
            <button onClick={onDraft} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#E8E7E3] text-[#787774] hover:bg-[#F7F6F3] transition-colors">
              Save as Draft
            </button>
          )}
          <button onClick={handleSubmit}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#3F5263] hover:bg-[#526373] transition-colors">
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
