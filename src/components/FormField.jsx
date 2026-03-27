export function FormField({ label, required, children, hint }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#787774] block mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-[#AEACA8] mt-1">{hint}</p>}
    </div>
  );
}

export function Input({ placeholder, defaultValue, value, onChange, type = 'text', className = '', readOnly, prefix }) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#787774]">{prefix}</span>}
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`notion-input w-full text-sm ${prefix ? 'pl-8' : ''} ${readOnly ? 'bg-[#F7F6F3] text-[#787774]' : ''} ${className}`}
      />
    </div>
  );
}

export function Select({ options, value, onChange, placeholder }) {
  return (
    <select value={value} onChange={onChange} className="notion-input w-full text-sm text-[#1A1A1A]">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
          {typeof o === 'string' ? o : o.label}
        </option>
      ))}
    </select>
  );
}

export function Textarea({ placeholder, rows = 3, value, onChange }) {
  return (
    <textarea
      placeholder={placeholder}
      rows={rows}
      value={value}
      onChange={onChange}
      className="notion-input w-full text-sm resize-none"
    />
  );
}

export function SectionTitle({ title, subtitle }) {
  return (
    <div className="pt-2">
      <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
      {subtitle && <p className="text-xs text-[#787774] mt-0.5">{subtitle}</p>}
      <div className="border-b border-[#E8E7E3] mt-2" />
    </div>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange && onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${checked ? 'bg-[#059669]' : 'bg-[#E8E7E3]'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform shadow-sm ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-sm text-[#1A1A1A]">{label}</span>
    </label>
  );
}
