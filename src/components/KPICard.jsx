export default function KPICard({ title, value, sub, icon: Icon, accent = '#1A1A1A', trend }) {
  return (
    <div className="bg-white border border-[#E9E9E7] rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold text-[#9A9A97] uppercase tracking-widest">{title}</p>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: accent + '15' }}>
            <Icon size={14} style={{ color: accent }} />
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">{value}</p>
      {sub && <p className="text-xs text-[#9A9A97] mt-1">{sub}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            trend.up ? 'bg-[#EDF3EC] text-[#0F7B6C]' : 'bg-[#FEF2F2] text-[#EB5757]'
          }`}>
            {trend.up ? '↑' : '↓'} {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}
