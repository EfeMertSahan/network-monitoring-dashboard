export type DeviceStatus =
  | "Online"
  | "Offline"
  | "Pending";

export type DeviceType = string;

export interface Device {
  id: number;
  hostname: string;
  ip_address: string;
  device_type: DeviceType;
  status: DeviceStatus;
  location: string;
  created_at: string;
  last_checked: string | null;
}

export interface DeviceListResponse {
  success: boolean;
  message: string;
  data: Device[];
}

export interface DeviceHealth {
  id: number;
  hostname: string;
  ip_address: string;
  device_type: DeviceType;
  status: DeviceStatus;
  location: string;
  last_checked: string | null;

  cpu_usage: number | null;
  ram_usage: number | null;
  disk_total_gb: number | null;
  disk_used_gb: number | null;
  disk_usage_percent: number | null;
  latency_ms: number | null;
  packet_loss: number | null;
  uptime_seconds: number | null;
  metric_timestamp: string | null;
}

export interface DeviceHealthListResponse {
  success: boolean;
  message: string;
  data: DeviceHealth[];
}