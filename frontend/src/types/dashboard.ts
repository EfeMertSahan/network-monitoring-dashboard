export interface DashboardData {
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  pending_devices: number;
  open_alerts: number;
  critical_alerts: number;
  warning_alerts: number;
  info_alerts: number;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}