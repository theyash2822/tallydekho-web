export default function KPICard({ title, value, sub, icon: Icon, accent = '#059669', trend }) {
  return (
    <div className="bg-white border border-[#E8E7E3] rounded-xl p-5 hover:shadow-notion-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-[#787774] uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: accent + '18' }}>
            <Icon size={14} style={{ color: accent }} />
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">{value}</p>
      {sub && <p className="text-xs text-[#787774] mt-1">{sub}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${trend.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
            {trend.up ? '↑' : '↓'} {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}
