import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getDeviceHealth } from "../api/devices";
import type { DeviceHealth } from "../types/device";

interface UseDeviceHealthState {
  data: DeviceHealth[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDeviceHealth(): UseDeviceHealthState {
  const [data, setData] =
    useState<DeviceHealth[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await getDeviceHealth();

      if (!response.success) {
        throw new Error(
          response.message ||
            "Cihaz sağlık verileri alınamadı.",
        );
      }

      setData(response.data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Cihaz sağlık verileri alınırken bilinmeyen bir hata oluştu.",
        );
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