export interface Alert {
  id: number;
  device_id: number;
  alert_type: string;
  level: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
  resolved_at: string | null;
}

export interface AlertPaginatedResponse {
  success: boolean;
  message: string;
  data: Alert[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}