import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  resetFilters,
  setAmountRange,
  setDateRange,
  setSearch,
  setSort,
  toggleCategory,
  toggleKind,
  togglePaymentMethod,
} from "../../store/filtersSlice";
import { selectActiveFilterCount, selectFilters } from "../../store/selectors";
import { useCategories } from "../../hooks/useCategories";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { EXPENSE_KINDS, PAYMENT_METHODS, SORT_OPTIONS } from "../../utils/constants";
import { currentMonthKey, monthBounds, shiftMonth, todayInputValue } from "../../utils/format";
import type { SortField, SortOrder } from "../../types/models";

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function ExpenseFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const activeCount = useAppSelector(selectActiveFilterCount);
  const { categories } = useCategories();
  const [expanded, setExpanded] = useState(false);

  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [minDraft, setMinDraft] = useState(filters.minAmount);
  const [maxDraft, setMaxDraft] = useState(filters.maxAmount);
  const debouncedSearch = useDebouncedValue(searchDraft);
  const debouncedMin = useDebouncedValue(minDraft);
  const debouncedMax = useDebouncedValue(maxDraft);

  const [syncedSearch, setSyncedSearch] = useState(filters.search);
  if (filters.search !== syncedSearch) {
    setSyncedSearch(filters.search);
    setSearchDraft(filters.search);
  }
  const [syncedAmounts, setSyncedAmounts] = useState(`${filters.minAmount}|${filters.maxAmount}`);
  const amountKey = `${filters.minAmount}|${filters.maxAmount}`;
  if (amountKey !== syncedAmounts) {
    setSyncedAmounts(amountKey);
    setMinDraft(filters.minAmount);
    setMaxDraft(filters.maxAmount);
  }

  useEffect(() => {
    if (debouncedSearch === searchDraft && debouncedSearch !== filters.search) dispatch(setSearch(debouncedSearch));
  }, [debouncedSearch, searchDraft, filters.search, dispatch]);

  useEffect(() => {
    const settled = debouncedMin === minDraft && debouncedMax === maxDraft;
    if (settled && (debouncedMin !== filters.minAmount || debouncedMax !== filters.maxAmount)) {
      dispatch(setAmountRange({ minAmount: debouncedMin, maxAmount: debouncedMax }));
    }
  }, [debouncedMin, debouncedMax, minDraft, maxDraft, filters.minAmount, filters.maxAmount, dispatch]);

  const presets = [
    { label: "This month", range: { startDate: monthBounds(currentMonthKey()).start, endDate: todayInputValue() } },
    {
      label: "Last month",
      range: {
        startDate: monthBounds(shiftMonth(currentMonthKey(), -1)).start,
        endDate: monthBounds(shiftMonth(currentMonthKey(), -1)).end,
      },
    },
    { label: "Last 30 days", range: { startDate: daysAgo(30), endDate: todayInputValue() } },
  ];

  const sortValue = `${filters.sortBy}:${filters.order}`;

  return (
    <div className="filters">
      <div className="filters__top">
        <label className="filters__search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search expenses</span>
          <input
            type="search"
            placeholder="Search by title or notes"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
          />
          {searchDraft && (
            <button type="button" aria-label="Clear search" onClick={() => setSearchDraft("")}>
              <X size={16} />
            </button>
          )}
        </label>

        <label className="filters__sort">
          <span className="sr-only">Sort expenses</span>
          <select
            value={SORT_OPTIONS.some((option) => option.value === sortValue) ? sortValue : ""}
            onChange={(event) => {
              const [sortBy, order] = event.target.value.split(":") as [SortField, SortOrder];
              dispatch(setSort({ sortBy, order }));
            }}
          >
            {!SORT_OPTIONS.some((option) => option.value === sortValue) && <option value="">Custom sort</option>}
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={`filters__toggle ${expanded ? "is-open" : ""}`}
          aria-expanded={expanded}
          aria-controls="filter-panel"
          onClick={() => setExpanded((open) => !open)}
        >
          <SlidersHorizontal size={17} />
          Filters
          {activeCount > 0 && <span className="filters__count num">{activeCount}</span>}
        </button>
      </div>

      <div id="filter-panel" className={`filters__panel ${expanded ? "is-open" : ""}`}>
        <fieldset className="filters__group">
          <legend>Category</legend>
          <div className="chips">
            {categories.map((category) => {
              const active = filters.categories.includes(category.id);
              return (
                <button
                  type="button"
                  key={category.id}
                  className={`chip ${active ? "is-active" : ""}`}
                  aria-pressed={active}
                  onClick={() => dispatch(toggleCategory(category.id))}
                  style={{ ["--chip-color" as string]: category.color }}
                >
                  <span className="chip__dot" aria-hidden="true" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="filters__group">
          <legend>Payment method</legend>
          <div className="chips">
            {PAYMENT_METHODS.map((method) => {
              const active = filters.paymentMethods.includes(method.value);
              return (
                <button
                  type="button"
                  key={method.value}
                  className={`chip chip--plain ${active ? "is-active" : ""}`}
                  aria-pressed={active}
                  onClick={() => dispatch(togglePaymentMethod(method.value))}
                >
                  {method.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="filters__group">
          <legend>Type</legend>
          <div className="chips">
            {EXPENSE_KINDS.map((kind) => {
              const active = filters.kinds.includes(kind.value);
              return (
                <button
                  type="button"
                  key={kind.value}
                  className={`chip chip--plain ${active ? "is-active" : ""}`}
                  aria-pressed={active}
                  title={kind.hint}
                  onClick={() => dispatch(toggleKind(kind.value))}
                >
                  {kind.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="filters__ranges">
          <fieldset className="filters__group">
            <legend>Date</legend>
            <div className="filters__pair">
              <input
                type="date"
                className="input"
                aria-label="From date"
                value={filters.startDate}
                max={filters.endDate || undefined}
                onChange={(event) =>
                  dispatch(setDateRange({ startDate: event.target.value, endDate: filters.endDate }))
                }
              />
              <span aria-hidden="true">to</span>
              <input
                type="date"
                className="input"
                aria-label="To date"
                value={filters.endDate}
                min={filters.startDate || undefined}
                onChange={(event) =>
                  dispatch(setDateRange({ startDate: filters.startDate, endDate: event.target.value }))
                }
              />
            </div>
            <div className="filters__presets">
              {presets.map((preset) => {
                const active = filters.startDate === preset.range.startDate && filters.endDate === preset.range.endDate;
                return (
                  <button
                    type="button"
                    key={preset.label}
                    className={`preset ${active ? "is-active" : ""}`}
                    onClick={() => dispatch(setDateRange(active ? { startDate: "", endDate: "" } : preset.range))}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="filters__group">
            <legend>Amount (RWF)</legend>
            <div className="filters__pair">
              <input
                type="number"
                className="input"
                inputMode="numeric"
                min="0"
                placeholder="Min"
                aria-label="Minimum amount"
                value={minDraft}
                onChange={(event) => setMinDraft(event.target.value)}
              />
              <span aria-hidden="true">to</span>
              <input
                type="number"
                className="input"
                inputMode="numeric"
                min="0"
                placeholder="Max"
                aria-label="Maximum amount"
                value={maxDraft}
                onChange={(event) => setMaxDraft(event.target.value)}
              />
            </div>
          </fieldset>
        </div>

        {activeCount > 0 && (
          <div className="filters__footer">
            <button type="button" className="link-btn" onClick={() => dispatch(resetFilters())}>
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}