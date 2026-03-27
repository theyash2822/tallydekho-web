import { X } from 'lucide-react';

// All data entry opens as a right-side drawer (not centered modal)
export default function FormModal({ open, onClose, title, subtitle, children }) {
  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" onClick={onClose} />

      {/* Drawer — slides from right */}
      <div className="fixed right-0 top-0 h-full z-50 flex flex-col bg-white shadow-[0_0_40px_rgba(0,0,0,0.12)] border-l border-[#E8E7E3]"
        style={{ width: 560 }}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#E8E7E3] flex-shrink-0 bg-white">
          <div>
            <h2 className="text-base font-semibold text-[#1A1A1A]">{title}</h2>
            {subtitle && <p className="text-xs text-[#787774] mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#787774] hover:bg-[#F1F0EC] hover:text-[#1A1A1A] transition-colors ml-4 flex-shrink-0">
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {children}
        </div>
      </div>
    </>
  );
}
