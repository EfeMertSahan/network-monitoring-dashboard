import apiClient from "./client";

import type {
  Device,
  DeviceHealthListResponse,
  DeviceListResponse,
} from "../types/device";

export async function getDevices(): Promise<DeviceListResponse> {
  const response =
    await apiClient.get<DeviceListResponse>(
      "/devices/",
    );

  return response.data;
}

export async function getDevice(
  deviceId: number,
): Promise<Device> {
  const response =
    await apiClient.get<Device>(
      `/devices/${deviceId}`,
    );

  return response.data;
}

export async function getDeviceHealth(): Promise<DeviceHealthListResponse> {
  const response =
    await apiClient.get<DeviceHealthListResponse>(
      "/devices/health",
    );

  return response.data;
}