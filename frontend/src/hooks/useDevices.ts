import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getDevices } from "../api/devices";
import type { Device } from "../types/device";

interface UseDevicesState {
  data: Device[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDevices(): UseDevicesState {
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getDevices();

      if (!response.success) {
        throw new Error(
          response.message ||
            "Cihazlar alınamadı.",
        );
      }

      setData(response.data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Cihazlar alınırken bilinmeyen bir hata oluştu.",
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