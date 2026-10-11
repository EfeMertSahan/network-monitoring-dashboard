import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getMetricSeries } from "../api/metrics";
import type {
  MetricPeriod,
  MetricsResponse,
} from "../types/metrics";

interface UseMetricsState {
  data: MetricsResponse[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMetrics(
  deviceId: number | null,
  period: MetricPeriod,
): UseMetricsState {
  const [data, setData] = useState<MetricsResponse[]>(
    [],
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (deviceId === null) {
      setData([]);
      setLoading(false);
      setError(null);

      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getMetricSeries(
        deviceId,
        period,
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Metrikler alınamadı.",
        );
      }

      setData(response.data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Metrikler alınırken bilinmeyen bir hata oluştu.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [deviceId, period]);

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