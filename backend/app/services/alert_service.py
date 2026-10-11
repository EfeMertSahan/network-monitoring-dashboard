from math import ceil

from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.alert_level import AlertLevel
from app.enums.alert_type import AlertType
from app.models.alert import Alert
from app.repositories.alert_repository import AlertRepository
from app.schemas.alert import AlertCreate


class AlertService:
    def __init__(
        self,
        session: AsyncSession,
    ):
        self.repository = AlertRepository(session)

    async def create(  #manuel/yapısal olarak alarm oluştur
        self,
        alert_data: AlertCreate,
    ) -> Alert:
        alert = Alert(
            device_id=alert_data.device_id,
            alert_type=alert_data.alert_type,
            level=alert_data.level,
            message=alert_data.message,
        )

        return await self.repository.create(alert)

    async def create_if_needed(  #Koşulları kontrol et; gerekiyorsa yeni alarm oluştur.
        self,
        device_id: int,
        alert_type: AlertType,
        level: AlertLevel,
        message: str,
    ) -> Alert | None:
        existing_alert = (
            await self.repository.get_open_by_device(
                device_id,
                alert_type,
            )
        )

        if existing_alert is not None:
            return None

        alert = Alert(
            device_id=device_id,
            alert_type=alert_type,
            level=level,
            message=message,
        )

        return await self.repository.create(alert)

    async def get_all( #Tüm alarmları getiriyor.
        self,
        is_resolved: bool | None = None,
        level: AlertLevel | None = None,
        alert_type: AlertType | None = None,
        device_id: int | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[Alert], int, int]:
        offset = (page - 1) * limit

        alerts, total = await self.repository.get_all(
            is_resolved=is_resolved,
            level=level,
            alert_type=alert_type,
            device_id=device_id,
            offset=offset,
            limit=limit,
        )

        total_pages = (
            ceil(total / limit) #Ceil:ondalıklı bir sayıyı her zaman bir üst tam sayıya yukarı yuvarlar.
            if total > 0
            else 0
        )

        return alerts, total, total_pages

    async def get_by_id(  #Tek alarm getiriyor.
        self,
        alert_id: int,
    ) -> Alert | None:
        return await self.repository.get_by_id(
            alert_id
        )

    async def resolve(
        self,
        alert_id: int,
    ) -> Alert | None:
        alert = await self.repository.get_by_id(
            alert_id
        )

        if alert is None:
            return None

        if alert.is_resolved:
            return alert

        return await self.repository.resolve(alert)

    async def resolve_open_by_device(  #Bu cihazın açık alarmı var mı?  Açık alarm yoksa yapılacak bir şey yok.
        self,
        device_id: int,
        alert_type: AlertType,
    ) -> Alert | None:
        alert = await self.repository.get_open_by_device(
            device_id,
            alert_type,
        )

        if alert is None:
            return None

        return await self.repository.resolve(alert)