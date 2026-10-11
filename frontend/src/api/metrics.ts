import apiClient from "./client";
import type {
  MetricPeriod,
  MetricsListResponse,
} from "../types/metrics";

export async function getMetricSeries(
  deviceId: number,
  period: MetricPeriod,
): Promise<MetricsListResponse> {
  const response = await apiClient.get<MetricsListResponse>(
    `/devices/${deviceId}/metrics/series`,
    {
      params: {
        last: period,
      },
    },
  );

  return response.data;
}