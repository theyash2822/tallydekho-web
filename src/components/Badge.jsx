const variants = {
  green:  'bg-[#E8F5ED] text-[#2D7D46] border border-[#A8D5BC]',
  red:    'bg-[#FDECEA] text-[#C0392B] border border-[#EDBBB8]',
  yellow: 'bg-[#FEF6E4] text-[#B45309] border border-[#F0D49A]',
  blue:   'bg-[#EBF2FF] text-[#2563EB] border border-[#BAD0F8]',
  gray:   'bg-[#F0F1F3] text-[#6B7280] border border-[#D9DCE0]',
  orange: 'bg-[#FEF6E4] text-[#B45309] border border-[#F0D49A]',
  purple: 'bg-[#F0F1F3] text-[#3F5263] border border-[#C5CBD0]',
};

export default function Badge({ label, variant = 'gray' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant] || variants.gray}`}>
      {label}
    </span>
  );
}
