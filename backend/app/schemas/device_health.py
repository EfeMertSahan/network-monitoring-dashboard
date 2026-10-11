#Bu dosya API'nin cihaz + son metric birleşik response'unu tanımlayacak.

from datetime import datetime

from pydantic import BaseModel, ConfigDict, IPvAnyAddress

from app.enums.device_status import DeviceStatus
from app.enums.device_type import DeviceType


class DeviceHealthResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    hostname: str
    ip_address: IPvAnyAddress
    device_type: DeviceType
    status: DeviceStatus
    location: str
    last_checked: datetime | None

    cpu_usage: int | None
    ram_usage: int | None
    disk_total_gb: int | None
    disk_used_gb: int | None
    disk_usage_percent: float | None
    latency_ms: float | None
    packet_loss: float | None
    uptime_seconds: int | None
    metric_timestamp: datetime | None


class DeviceHealthListResponse(BaseModel):
    success: bool
    message: str
    data: list[DeviceHealthResponse]