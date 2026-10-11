import { useCallback, useEffect, useState } from "react";

import { getDashboard } from "../api/dashboard";
import type { DashboardData } from "../types/dashboard";

interface UseDashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboard(): UseDashboardState {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getDashboard();

      if (!response.success) {
        throw new Error(
          response.message || "Dashboard verileri alınamadı.",
        );
      }

      setData(response.data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Dashboard verileri alınırken bilinmeyen bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}