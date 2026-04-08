// TallyDekho badge — matches design spec color system
const variants = {
  green:   'bg-[#EDF3EC] text-[#0F7B6C] border border-[#B7D4B2]',   // Paid / OK
  red:     'bg-[#FDEBEC] text-[#EB5757] border border-[#F5C0C0]',   // Overdue / Critical
  yellow:  'bg-[#FAEBDD] text-[#D9730D] border border-[#F5C98A]',   // Pending / Warning
  orange:  'bg-[#FAEBDD] text-[#D9730D] border border-[#F5C98A]',   // Pending / Warning
  blue:    'bg-[#E7F3F8] text-[#2383E2] border border-[#A8D4EF]',   // Syncing / Info
  gray:    'bg-[#F1F1EF] text-[#787774] border border-[#E9E9E7]',   // Draft / Cancelled
  purple:  'bg-[#F1F1EF] text-[#787774] border border-[#E9E9E7]',
};

export default function Badge({ label, variant = 'gray' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${variants[variant] || variants.gray}`}>
      {label}
    </span>
  );
}
