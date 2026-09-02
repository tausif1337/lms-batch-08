import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PAGE_SIZES } from "../useTableQuery.js";

// How many numbered buttons to draw. With 22 pages and the reader on 11, the
// row reads 9 10 [11] 12 13 rather than every number from 1 to 22.
const WINDOW = 5;

function pagesAround(page, totalPages) {
  if (totalPages <= WINDOW) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  // Keep the window full at both ends: on page 1 it runs 1..5, and on the
  // last page it runs (last-4)..last, instead of trailing off.
  let first = page - Math.floor(WINDOW / 2);
  first = Math.max(1, Math.min(first, totalPages - WINDOW + 1));

  return Array.from({ length: WINDOW }, (_, index) => first + index);
}

const numberLook =
  "min-w-9 rounded-md border px-2 py-1.5 text-sm font-medium disabled:opacity-40";

function Step({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
    >
      {children}
    </button>
  );
}

// The strip under a table: how many rows are being shown, how big a page is,
// and the buttons to move between them.
export default function Pagination({
  page,
  pageSize,
  count,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) {
  // The row numbers of the page being looked at. On page 3 of 10-row pages
  // that is 21 to 30, or 21 to 24 if the table stops there.
  const firstRow = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow = Math.min(page * pageSize, count);

  const lastPage = Math.max(totalPages, 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
      <p className="text-sm text-slate-500">
        {count === 0
          ? "No rows"
          : `Showing ${firstRow}–${lastRow} of ${count}`}
      </p>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-500">
          Rows
          <select
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
            value={pageSize}
            onChange={(event) => onPageSizeChange(event.target.value)}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <nav aria-label="Pages" className="flex items-center gap-1">
          <Step
            label="First page"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
          >
            <ChevronsLeft size={16} />
          </Step>

          <Step
            label="Previous page"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft size={16} />
          </Step>

          {pagesAround(page, lastPage).map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => onPageChange(number)}
              // Screen readers announce which one is the page you are on;
              // sighted readers get the filled-in button.
              aria-current={number === page ? "page" : undefined}
              className={
                number === page
                  ? `${numberLook} border-indigo-600 bg-indigo-600 text-white`
                  : `${numberLook} border-slate-300 bg-white text-slate-700 hover:bg-slate-50`
              }
            >
              {number}
            </button>
          ))}

          <Step
            label="Next page"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= lastPage}
          >
            <ChevronRight size={16} />
          </Step>

          <Step
            label="Last page"
            onClick={() => onPageChange(lastPage)}
            disabled={page >= lastPage}
          >
            <ChevronsRight size={16} />
          </Step>
        </nav>
      </div>
    </div>
  );
}
