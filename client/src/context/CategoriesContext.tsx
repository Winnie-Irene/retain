import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { categoryApi } from "../api/services";
import { errorMessage } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import type { Category } from "../types/models";
import { CategoriesContext, type CategoriesContextValue } from "./categoriesContextValue";

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { categories: list } = await categoryApi.list();
      setCategories(list);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    categoryApi
      .list()
      .then(({ categories: list }) => {
        if (active) setCategories(list);
      })
      .catch((caught: unknown) => {
        if (active) setError(errorMessage(caught));
      });
    return () => {
      active = false;
    };
  }, [status]);

  const value = useMemo<CategoriesContextValue>(
    () => ({
      categories: status === "authenticated" ? categories : [],
      loading,
      error,
      refresh,
      byId: new Map(categories.map((category) => [category.id, category])),
    }),
    [categories, loading, error, refresh, status],
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}