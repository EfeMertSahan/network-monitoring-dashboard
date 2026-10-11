import apiClient from "./client";

import type {
  AlertPaginatedResponse,
  Alert,
} from "../types/alert";

interface GetAlertsOptions {
  isResolved?: boolean;
  level?: string;
  alertType?: string;
  deviceId?: number;
  page?: number;
  limit?: number;
}

export async function getAlerts(
  options: GetAlertsOptions = {},
): Promise<AlertPaginatedResponse> {
  const response =
    await apiClient.get<AlertPaginatedResponse>(
      "/alerts/",
      {
        params: {
          is_resolved:
            options.isResolved,
          level: options.level,
          alert_type:
            options.alertType,
          device_id:
            options.deviceId,
          page: options.page ?? 1,
          limit:
            options.limit ?? 20,
        },
      },
    );

  return response.data;
}

export async function resolveAlert(
  alertId: number,
): Promise<Alert> {
  const response =
    await apiClient.put<{
      success: boolean;
      message: string;
      data: Alert;
    }>(
      `/alerts/${alertId}/resolve`,
    );

  return response.data.data;
}