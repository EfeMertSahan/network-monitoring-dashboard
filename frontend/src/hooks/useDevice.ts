import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getDevice } from "../api/devices";
import type { Device } from "../types/device";

interface UseDeviceState {
  data: Device | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDevice(
  deviceId: number | null,
): UseDeviceState {
  const [data, setData] =
    useState<Device | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (deviceId === null) {
      setData(null);
      setLoading(false);
      setError(null);

      return;
    }

    try {
      setLoading(true);
      setError(null);

      const device =
        await getDevice(deviceId);

      setData(device);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Cihaz bilgileri alınırken bilinmeyen bir hata oluştu.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

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