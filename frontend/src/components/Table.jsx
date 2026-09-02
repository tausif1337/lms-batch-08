import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

// The header row is built from a list of columns. The body rows stay in the
// pages themselves, because each one formats its cells differently.
//
// A column is either a plain string, for a column there is no point sorting
// on ("Action"), or {label, field} where `field` is the name the server knows
// the column by and will accept in ?ordering=.
//
//   columns={["ID", {label: "Name", field: "name"}, "Action"]}
//
// `ordering` is the sort in force, as the server spells it: "name" ascending,
// "-name" descending. Leave `onSort` out and the headers are plain text.
export default function Table({
  columns,
  ordering,
  onSort,
  isEmpty = false,
  emptyMessage = "Nothing to show.",
  children,
}) {
  function sortIcon(field) {
    if (ordering === field) {
      return <ArrowUp size={12} />;
    }
    if (ordering === `-${field}`) {
      return <ArrowDown size={12} />;
    }
    // Shown faintly on the unsorted columns so it is clear they can be
    // clicked, without competing with the column that is actually sorted.
    return <ChevronsUpDown size={12} className="text-slate-300" />;
  }

  function headerCell(column, index) {
    const isSortable = onSort && typeof column === "object" && column.field;
    const label = typeof column === "object" ? column.label : column;

    if (!isSortable) {
      return (
        <th key={index} className="px-3 py-2 font-medium">
          {label}
        </th>
      );
    }

    const isSorted = ordering === column.field || ordering === `-${column.field}`;

    return (
      <th
        key={index}
        className="px-3 py-2 font-medium"
        // Announced by screen readers as "sorted ascending" on the column
        // that is sorted, and left off the rest.
        aria-sort={
          isSorted
            ? ordering.startsWith("-")
              ? "descending"
              : "ascending"
            : undefined
        }
      >
        <button
          type="button"
          onClick={() => onSort(column.field)}
          title={`Sort by ${label.toLowerCase()}`}
          className={
            "-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 uppercase hover:text-slate-800 " +
            (isSorted ? "text-slate-800" : "")
          }
        >
          {label}
          {sortIcon(column.field)}
        </button>
      </th>
    );
  }

  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
            {columns.map(headerCell)}
          </tr>
        </thead>

        <tbody>
          {isEmpty ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-sm text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
