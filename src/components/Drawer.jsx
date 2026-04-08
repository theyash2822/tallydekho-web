import { X } from 'lucide-react';

export default function Drawer({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/15 backdrop-blur-[1px] z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[480px] bg-white z-50 flex flex-col shadow-xl border-l border-[#E9E9E7]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F7F7F5]">
          <h2 className="text-sm font-semibold text-[#1A1A1A]">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#9A9A97] hover:bg-[#F7F7F5] hover:text-[#1A1A1A] transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>
  );
}
