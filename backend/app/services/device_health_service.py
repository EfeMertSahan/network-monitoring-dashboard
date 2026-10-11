from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.device_health_repository import (
    DeviceHealthRepository,
)
from app.schemas.device_health import (
    DeviceHealthResponse,
)


class DeviceHealthService:
    def __init__(self, session: AsyncSession):
        self.repository = DeviceHealthRepository(
            session
        )

    async def get_all(
        self,
    ) -> list[DeviceHealthResponse]:
        rows = await self.repository.get_all()

        response_data: list[DeviceHealthResponse] = []

        for row in rows:
            (
                device,
                cpu_usage,
                ram_usage,
                disk_total_gb,
                disk_used_gb,
                latency_ms,
                packet_loss,
                uptime_seconds,
                metric_timestamp,
            ) = row

            disk_usage_percent = None

            if (
                disk_total_gb is not None
                and disk_total_gb > 0
                and disk_used_gb is not None
            ):
                disk_usage_percent = round(
                    (
                        disk_used_gb
                        / disk_total_gb
                    )
                    * 100,
                    2,
                )

            response_data.append(
                DeviceHealthResponse(
                    id=device.id,
                    hostname=device.hostname,
                    ip_address=device.ip_address,
                    device_type=device.device_type,
                    status=device.status,
                    location=device.location,
                    last_checked=device.last_checked,
                    cpu_usage=cpu_usage,
                    ram_usage=ram_usage,
                    disk_total_gb=disk_total_gb,
                    disk_used_gb=disk_used_gb,
                    disk_usage_percent=disk_usage_percent,
                    latency_ms=latency_ms,
                    packet_loss=packet_loss,
                    uptime_seconds=uptime_seconds,
                    metric_timestamp=metric_timestamp,
                )
            )

        return response_data