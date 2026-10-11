import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getTopologyLinks } from "../api/topology";

import type { DeviceLink } from "../types/topology";

const REFRESH_INTERVAL_MS = 30_000;

export function useTopology() {
  const [links, setLinks] =
    useState<DeviceLink[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refresh = useCallback(
    async () => {
      try {
        setError(null);

        const data =
          await getTopologyLinks();

        setLinks(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Topology verileri alınırken bilinmeyen bir hata oluştu.",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void refresh();

    const intervalId =
      window.setInterval(() => {
        void refresh();
      }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, [refresh]);

  return {
    links,
    loading,
    error,
    refresh,
  };
}