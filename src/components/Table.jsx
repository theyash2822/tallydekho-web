export default function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E8E7E3]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E8E7E3] bg-[#FBFAF8]">
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-[#787774] uppercase tracking-wide whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-12 text-[#787774] text-sm">No records found</td></tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b border-[#F1F0EC] last:border-0 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-[#F7F6F3]' : ''}`}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-[#1A1A1A] whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
