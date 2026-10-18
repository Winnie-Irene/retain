import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { currentMonthKey } from "../utils/format";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function useMonthParam(): [string, (month: string) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get("month");
  const month = raw && MONTH_PATTERN.test(raw) ? raw : currentMonthKey();

  const setMonth = useCallback(
    (next: string) => {
      setParams(
        (previous) => {
          const updated = new URLSearchParams(previous);
          if (next === currentMonthKey()) updated.delete("month");
          else updated.set("month", next);
          return updated;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return [month, setMonth];
}