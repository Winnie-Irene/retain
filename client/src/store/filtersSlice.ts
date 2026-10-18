import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PaymentMethod, SortField, SortOrder } from "../types/models";

export interface FiltersState {
  search: string;
  categories: string[];
  paymentMethods: PaymentMethod[];
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: SortField;
  order: SortOrder;
  page: number;
  limit: number;
}

export const initialFiltersState: FiltersState = {
  search: "",
  categories: [],
  paymentMethods: [],
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  order: "desc",
  page: 1,
  limit: 10,
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

const filtersSlice = createSlice({
  name: "filters",
  initialState: initialFiltersState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    toggleCategory(state, action: PayloadAction<string>) {
      state.categories = toggle(state.categories, action.payload);
      state.page = 1;
    },
    setCategories(state, action: PayloadAction<string[]>) {
      state.categories = action.payload;
      state.page = 1;
    },
    togglePaymentMethod(state, action: PayloadAction<PaymentMethod>) {
      state.paymentMethods = toggle(state.paymentMethods, action.payload);
      state.page = 1;
    },
    setDateRange(state, action: PayloadAction<{ startDate: string; endDate: string }>) {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.page = 1;
    },
    setAmountRange(state, action: PayloadAction<{ minAmount: string; maxAmount: string }>) {
      state.minAmount = action.payload.minAmount;
      state.maxAmount = action.payload.maxAmount;
      state.page = 1;
    },
    setSort(state, action: PayloadAction<{ sortBy: SortField; order: SortOrder }>) {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order;
      state.page = 1;
    },
    toggleSortField(state, action: PayloadAction<SortField>) {
      if (state.sortBy === action.payload) {
        state.order = state.order === "asc" ? "desc" : "asc";
      } else {
        state.sortBy = action.payload;
        state.order = action.payload === "title" ? "asc" : "desc";
      }
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = Math.max(1, action.payload);
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
      state.page = 1;
    },
    applyQuickFilter(state, action: PayloadAction<Partial<FiltersState>>) {
      return { ...initialFiltersState, limit: state.limit, ...action.payload, page: 1 };
    },
    resetFilters(state) {
      return { ...initialFiltersState, limit: state.limit };
    },
  },
});

export const {
  setSearch,
  toggleCategory,
  setCategories,
  togglePaymentMethod,
  setDateRange,
  setAmountRange,
  setSort,
  toggleSortField,
  setPage,
  setLimit,
  applyQuickFilter,
  resetFilters,
} = filtersSlice.actions;

export const filtersReducer = filtersSlice.reducer;