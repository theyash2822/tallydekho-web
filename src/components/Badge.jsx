const variants = {
  green:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  red:    'bg-rose-50 text-rose-600 border border-rose-200',
  yellow: 'bg-amber-50 text-amber-700 border border-amber-200',
  blue:   'bg-[#ECFDF5] text-[#059669] border border-[#059669] 200',
  gray:   'bg-[#F1F0EC] text-[#787774] border border-[#E8E7E3]',
  orange: 'bg-orange-50 text-orange-600 border border-orange-200',
  purple: 'bg-violet-50 text-violet-600 border border-violet-200',
};

export default function Badge({ label, variant = 'gray' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant] || variants.gray}`}>
      {label}
    </span>
  );
}
