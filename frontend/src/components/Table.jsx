// The header row is built from a list of column names. The body rows stay in
// the pages themselves, because each one formats its cells differently.
export default function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
            {columns.map((column, index) => (
              <th key={index} className="px-3 py-2 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
