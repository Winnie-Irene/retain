import { useContext } from "react";
import { CategoriesContext, type CategoriesContextValue } from "../context/categoriesContextValue";

export function useCategories(): CategoriesContextValue {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used inside a CategoriesProvider");
  }
  return context;
}