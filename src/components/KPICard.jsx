export default function KPICard({ title, value, sub, icon: Icon, accent = '#3F5263', trend }) {
  return (
    <div className="bg-white border border-[#D9DCE0] rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">{title}</p>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: accent + '18' }}>
            <Icon size={14} style={{ color: accent }} />
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-[#1C2B3A] tracking-tight">{value}</p>
      {sub && <p className="text-xs text-[#9CA3AF] mt-1">{sub}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            trend.up
              ? 'bg-[#E8F5ED] text-[#2D7D46]'
              : 'bg-[#FDECEA] text-[#C0392B]'
          }`}>
            {trend.up ? '↑' : '↓'} {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}
