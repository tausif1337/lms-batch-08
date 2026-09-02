import { Search, X } from "lucide-react";
import { inputBox, labelText } from "./styles.js";

// The strip above a table: one search box, whatever dropdowns the page passes
// as children, and a Clear button that only appears once there is something
// to clear.
//
// The controls are laid out here but owned by useTableQuery, so a page wires
// them up rather than keeping state of its own.
export default function FilterBar({
  search,
  onSearchChange,
  placeholder = "Search...",
  isFiltered,
  onClear,
  children,
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 px-4 py-3">
      <div className="min-w-56 flex-1">
        <label htmlFor="table-search" className={labelText}>
          Search
        </label>

        <div className="relative">
          {/* Decorative: the label already says what the box is for, so the
              icon is hidden from screen readers instead of read out. */}
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3 my-auto text-slate-400"
          />

          <input
            id="table-search"
            name="search"
            type="search"
            className={inputBox + " pl-9"}
            placeholder={placeholder}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>

      {children}

      {isFiltered && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <X size={14} />
          Clear
        </button>
      )}
    </div>
  );
}
