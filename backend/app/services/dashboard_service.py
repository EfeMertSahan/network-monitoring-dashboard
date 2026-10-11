#Repository'lerden gelen sayıları birleştirip Dashboard verisini oluşturmak.

from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.alert_level import AlertLevel
from app.enums.device_status import DeviceStatus
from app.repositories.alert_repository import AlertRepository
from app.repositories.device_repository import DeviceRepository


class DashboardService:
    def __init__(
        self,
        session: AsyncSession,
    ):
        self.device_repository = DeviceRepository(
            session
        )

        self.alert_repository = AlertRepository(
            session
        )

    async def get_summary(self) -> dict:
        total_devices = (
            await self.device_repository.count_active()
        )

        online_devices = (
            await self.device_repository.count_by_status(
                DeviceStatus.Online
            )
        )

        offline_devices = (
            await self.device_repository.count_by_status(
                DeviceStatus.Offline
            )
        )

        pending_devices = (
            await self.device_repository.count_by_status(
                DeviceStatus.Pending
            )
        )

        open_alerts = (
            await self.alert_repository.count(
                is_resolved=False
            )
        )

        critical_alerts = (
            await self.alert_repository.count(
                is_resolved=False,
                level=AlertLevel.Critical,
            )
        )

        warning_alerts = (
            await self.alert_repository.count(
                is_resolved=False,
                level=AlertLevel.Warning,
            )
        )

        info_alerts = (
            await self.alert_repository.count(
                is_resolved=False,
                level=AlertLevel.Info,
            )
        )

        return {
            "total_devices": total_devices,
            "online_devices": online_devices,
            "offline_devices": offline_devices,
            "pending_devices": pending_devices,
            "open_alerts": open_alerts,
            "critical_alerts": critical_alerts,
            "warning_alerts": warning_alerts,
            "info_alerts": info_alerts,
        }