import apiClient from "./client";

import type {
  DeviceLink,
  DeviceLinkListResponse,
} from "../types/topology";

export async function getTopologyLinks(): Promise<
  DeviceLink[]
> {
  const response =
    await apiClient.get<DeviceLinkListResponse>(
      "/topology/links",
    );

  if (!response.data.success) {
    throw new Error(
      response.data.message ||
        "Topology bağlantıları alınamadı.",
    );
  }

  return response.data.data;
}