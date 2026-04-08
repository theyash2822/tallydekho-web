// Notion-style calm badges — purposeful color, never harsh
const variants = {
  green:   'bg-[#E8F5ED] text-[#2D7D46] border border-[#A8D5BC]',
  red:     'bg-[#FDECEA] text-[#C0392B] border border-[#EDBBB8]',
  yellow:  'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
  blue:    'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]',
  gray:    'bg-[#F5F4EF] text-[#787774] border border-[#E9E8E3]',
  orange:  'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
  purple:  'bg-[#F5F4EF] text-[#787774] border border-[#E9E8E3]',
};

export default function Badge({ label, variant = 'gray' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${variants[variant] || variants.gray}`}>
      {label}
    </span>
  );
}
