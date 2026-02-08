import { useState, useCallback } from "react";
import type { Software } from "../types";
import { searchApps, lookupApp } from "../api/search";

export function useSearch() {
  const [results, setResults] = useState<Software[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (term: string, country: string, entity: string) => {
      setLoading(true);
      setError(null);
      try {
        const apps = await searchApps(term, country, entity);
        setResults(apps);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const lookup = useCallback(async (bundleId: string, country: string) => {
    setLoading(true);
    setError(null);
    try {
      const app = await lookupApp(bundleId, country);
      setResults(app ? [app] : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search, lookup };
}
