import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { expenseApi } from "../api/services";
import { errorMessage } from "../api/client";
import type { Expense } from "../types/models";
import type { Pagination } from "../types/api";
import type { FiltersState } from "./filtersSlice";

export interface ExpensesState {
  items: Expense[];
  pagination: Pagination;
  totalAmount: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  requestId: string | null;
}

const initialState: ExpensesState = {
  items: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  totalAmount: 0,
  status: "idle",
  error: null,
  requestId: null,
};

export function filtersToQuery(filters: FiltersState) {
  return {
    search: filters.search.trim(),
    categories: filters.categories,
    paymentMethods: filters.paymentMethods,
    startDate: filters.startDate,
    endDate: filters.endDate,
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount,
    sortBy: filters.sortBy,
    order: filters.order,
    page: filters.page,
    limit: filters.limit,
  };
}

export const fetchExpenses = createAsyncThunk<
  Awaited<ReturnType<typeof expenseApi.list>>,
  void,
  { state: { filters: FiltersState }; rejectValue: string }
>("expenses/fetch", async (_arg, { getState, signal, rejectWithValue }) => {
  try {
    return await expenseApi.list(filtersToQuery(getState().filters), signal);
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    clearExpenses() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.status = "succeeded";
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId || action.meta.aborted) return;
        state.status = "failed";
        state.error = action.payload ?? "Could not load expenses";
      });
  },
});

export const { clearExpenses } = expensesSlice.actions;
export const expensesReducer = expensesSlice.reducer;