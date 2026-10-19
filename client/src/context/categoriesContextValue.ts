import { createContext } from "react";
import type { Category } from "../types/models";

export interface CategoriesContextValue {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  byId: Map<string, Category>;
}

export const CategoriesContext = createContext<CategoriesContextValue | null>(null);