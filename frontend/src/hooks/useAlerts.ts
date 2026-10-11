import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getAlerts,
  resolveAlert,
} from "../api/alerts";

import type { Alert } from "../types/alert";

interface UseAlertsOptions {
  isResolved?: boolean;
  level?: string;
  alertType?: string;
  deviceId?: number | null;
  page?: number;
  limit?: number;
}

interface UseAlertsState {
  data: Alert[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  refresh: () => Promise<void>;
  resolve: (
    alertId: number,
  ) => Promise<void>;
}

export function useAlerts(
  options: UseAlertsOptions = {},
): UseAlertsState {
  const {
    isResolved,
    level,
    alertType,
    deviceId,
    page = 1,
    limit = 20,
  } = options;

  const [data, setData] =
    useState<Alert[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const refresh = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getAlerts({
            isResolved,
            level,
            alertType,
            deviceId:
              deviceId ?? undefined,
            page,
            limit,
          });

        if (!response.success) {
          throw new Error(
            response.message ||
              "Alarmlar alınamadı.",
          );
        }

        setData(response.data);
        setTotal(response.total);
        setTotalPages(
          response.total_pages,
        );
      } catch (error) {
        if (error instanceof Error) {
          setError(
            error.message,
          );
        } else {
          setError(
            "Alarmlar alınırken bilinmeyen bir hata oluştu.",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [
      isResolved,
      level,
      alertType,
      deviceId,
      page,
      limit,
    ],
  );

  const resolve = useCallback(
    async (alertId: number) => {
      try {
        setError(null);

        await resolveAlert(
          alertId,
        );

        await refresh();
      } catch (error) {
        if (error instanceof Error) {
          setError(
            error.message,
          );
        } else {
          setError(
            "Alarm çözülürken bilinmeyen bir hata oluştu.",
          );
        }
      }
    },
    [refresh],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    total,
    totalPages,
    refresh,
    resolve,
  };
}