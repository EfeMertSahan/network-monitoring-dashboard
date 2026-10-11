export type TopologyLinkType =
  | "ethernet"
  | "fiber"
  | "wireless"
  | "vpn"
  | "other";

export type TopologyLinkStatus =
  | "up"
  | "down"
  | "unknown";

export interface DeviceLink {
  id: number;
  source_device_id: number;
  target_device_id: number;
  link_type: TopologyLinkType | string;
  status: TopologyLinkStatus | string;
  created_at: string;
  updated_at: string;
}

export interface DeviceLinkListResponse {
  success: boolean;
  message: string;
  data: DeviceLink[];
}