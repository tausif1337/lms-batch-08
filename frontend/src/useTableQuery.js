import { useCallback, useEffect, useMemo, useState } from "react";

// Everything the eight table pages need to ask the server for one page of
// rows: which page, how big, what was typed in the search box, what column
// the table is sorted on, and the value of each dropdown filter.
//
// It is a hook and not eight copies of the same fifteen useState lines. The
// page hands `query.params` to the API and re-runs its effect whenever that
// object changes.

export const PAGE_SIZES = [10, 25, 50, 100];

// Typing "sarah" is six keystrokes. Waiting a moment after the last one
// turns six requests into one.
const TYPING_PAUSE_MS = 300;

export default function useTableQuery(options = {}) {
  const {
    ordering: firstOrdering = "id",
    pageSize: firstPageSize = 10,
    filters: firstFilters = {},
  } = options;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(firstPageSize);

  // Two search values, not one. `searchBox` is what the input shows and
  // updates on every keystroke; `search` is what gets sent, and it lags
  // behind by TYPING_PAUSE_MS.
  const [searchBox, setSearchBox] = useState("");
  const [search, setSearch] = useState("");

  const [ordering, setOrdering] = useState(firstOrdering);
  const [filters, setFilters] = useState(firstFilters);

  useEffect(() => {
    if (searchBox === search) {
      return;
    }

    const timer = setTimeout(() => {
      setSearch(searchBox);
      // A new search is a new result set, so page 4 of the old one is
      // meaningless. Same reason the filter and sort setters below reset it.
      setPage(1);
    }, TYPING_PAUSE_MS);

    return () => clearTimeout(timer);
  }, [searchBox, search]);

  const setPageSize = useCallback((next) => {
    setPageSizeState(Number(next));
    setPage(1);
  }, []);

  const setFilter = useCallback((name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  }, []);

  // Clicking a column header sorts by it. Clicking the same one again turns
  // the sort around, which is what the leading "-" means to the server.
  const toggleSort = useCallback((field) => {
    setOrdering((current) => (current === field ? `-${field}` : field));
    setPage(1);
  }, []);

  const clear = useCallback(() => {
    setSearchBox("");
    setSearch("");
    setFilters(firstFilters);
    setOrdering(firstOrdering);
    setPage(1);
    // The page size is deliberately left alone: it is a preference about the
    // screen, not part of the question being asked of the data.
  }, [firstFilters, firstOrdering]);

  // True when the "Clear" button has something to undo.
  const isFiltered =
    searchBox !== "" ||
    ordering !== firstOrdering ||
    Object.keys(filters).some((name) => {
      const value = filters[name];
      return value !== undefined && value !== "" && value !== firstFilters[name];
    });

  // Memoised so that it is the same object from one render to the next. A
  // page lists it as a dependency of the effect that loads the rows, and an
  // object rebuilt every render would make that effect loop.
  const params = useMemo(
    () => ({ page, page_size: pageSize, search, ordering, ...filters }),
    [page, pageSize, search, ordering, filters],
  );

  // Delete the only row on the last page and the browser is left asking for
  // a page that no longer exists, which the server answers with a 404. Step
  // back one instead of showing that as an error.
  const stepBackAfter = useCallback(
    (problem) => {
      if (page > 1 && /invalid page/i.test(problem?.message ?? "")) {
        setPage((current) => current - 1);
        return true;
      }
      return false;
    },
    [page],
  );

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    searchBox,
    setSearchBox,
    ordering,
    toggleSort,
    filters,
    setFilter,
    clear,
    isFiltered,
    params,
    stepBackAfter,
  };
}
