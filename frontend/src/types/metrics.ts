export type MetricPeriod = "1h" | "6h" | "24h" | "7d";

export interface MetricsResponse {
  id: number;
  device_id: number;
  cpu_usage: number | null;
  ram_usage: number | null;
  disk_total_gb: number | null;
  disk_used_gb: number | null;
  latency_ms: number | null;
  packet_loss: number | null;
  uptime_seconds: number | null;
  timestamp: string;
}

export interface MetricsListResponse {
  success: boolean;
  message: string;
  data: MetricsResponse[];
}