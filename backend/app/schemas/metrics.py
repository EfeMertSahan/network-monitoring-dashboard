#Buradaki metrikleri MetricsResponse'a gönderiyorum.
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MetricsResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    device_id: int
    cpu_usage: int | None
    ram_usage: int | None
    disk_total_gb: int | None
    disk_used_gb: int | None
    latency_ms: float | None
    packet_loss: float | None
    uptime_seconds: int | None
    timestamp: datetime


class MetricsListResponse(BaseModel):
    success: bool
    message: str
    data: list[MetricsResponse]


class MetricsPaginatedResponse(BaseModel):
    success: bool
    message: str
    data: list[MetricsResponse]
    page: int
    limit: int
    total: int
    total_pages: int