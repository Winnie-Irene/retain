import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "../api/client";

interface RemoteState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface Settled<T> {
  key: string;
  data: T | null;
  error: string | null;
}

export function useRemote<T>(loader: () => Promise<T>, key: string): RemoteState<T> {
  const [version, setVersion] = useState(0);
  const [settled, setSettled] = useState<Settled<T>>({ key: "", data: null, error: null });
  const loaderRef = useRef(loader);
  const requestKey = `${key}#${version}`;

  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    let active = true;
    loaderRef
      .current()
      .then((data) => {
        if (active) setSettled({ key: requestKey, data, error: null });
      })
      .catch((caught: unknown) => {
        if (active) setSettled((previous) => ({ key: requestKey, data: previous.data, error: errorMessage(caught) }));
      });
    return () => {
      active = false;
    };
  }, [requestKey]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  const loading = settled.key !== requestKey;

  return { data: settled.data, loading, error: loading ? null : settled.error, reload };
}