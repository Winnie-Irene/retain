import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import { initialFiltersState } from "./filtersSlice";

export const selectFilters = (state: RootState) => state.filters;
export const selectExpenses = (state: RootState) => state.expenses;

export const selectActiveFilterCount = createSelector(selectFilters, (filters) => {
  let count = 0;
  if (filters.search.trim()) count += 1;
  count += filters.categories.length;
  count += filters.paymentMethods.length;
  if (filters.startDate || filters.endDate) count += 1;
  if (filters.minAmount || filters.maxAmount) count += 1;
  return count;
});

export const selectIsDefaultSort = createSelector(
  selectFilters,
  (filters) => filters.sortBy === initialFiltersState.sortBy && filters.order === initialFiltersState.order,
);