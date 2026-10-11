#Bu katmanda amacımız, Alert ile ilgili yalnızca veritabanı işlemlerini yapmak.

from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.alert_level import AlertLevel
from app.enums.alert_type import AlertType
from app.models.alert import Alert


class AlertRepository: #Alert database işlemlerimizi bu sınıfta topluyoruz.
    def __init__(
        self,
        session: AsyncSession,
    ):
        self.session = session

    async def create(  #yeni alarm oluştur
        self,
        alert: Alert,
    ) -> Alert:
        self.session.add(alert)

        await self.session.commit()

        await self.session.refresh(alert)

        return alert

    async def get_all( #Bütün alarm kayıtlarını getiriyor.
        self,
        is_resolved: bool | None = None,
        level: AlertLevel | None = None,
        alert_type: AlertType | None = None,
        device_id: int | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[Alert], int]:
        query = select(Alert)

        count_query = select(
            func.count(Alert.id)
        )

        if is_resolved is not None:
            query = query.where(
                Alert.is_resolved == is_resolved
            )

            count_query = count_query.where(
                Alert.is_resolved == is_resolved
            )

        if level is not None:
            query = query.where(
                Alert.level == level
            )

            count_query = count_query.where(
                Alert.level == level
            )

        if alert_type is not None:
            query = query.where(
                Alert.alert_type == alert_type
            )

            count_query = count_query.where(
                Alert.alert_type == alert_type
            )

        if device_id is not None:
            query = query.where(
                Alert.device_id == device_id
            )

            count_query = count_query.where(
                Alert.device_id == device_id
            )

        query = (
            query
            .order_by(
                Alert.created_at.desc()  #En yeni alarm en üstte olacak.
            )
            .offset(offset)
            .limit(limit)
        )

        result = await self.session.execute(query)

        count_result = await self.session.execute(
            count_query
        )

        alerts = result.scalars().all()
        total = count_result.scalar_one()

        return alerts, total

    async def count(  #Alarm sayısını döndürmek.
        self,
        is_resolved: bool | None = None,
        level: AlertLevel | None = None,
    ) -> int:
        query = select(
            func.count(Alert.id)
        )

        if is_resolved is not None:
            query = query.where(
                Alert.is_resolved == is_resolved
            )

        if level is not None:
            query = query.where(
                Alert.level == level
            )

        result = await self.session.execute(query)

        return result.scalar_one()

    async def get_by_id(  #Belirli bir alarmı ID üzerinden getiriyor.
        self,
        alert_id: int,
    ) -> Alert | None:
        result = await self.session.execute(
            select(Alert).where(
                Alert.id == alert_id
            )
        )

        return result.scalar_one_or_none()

    async def get_open_by_device(  #Bu cihazın açık alarmı var mı?  Varsa yeni alarm oluşturmayacağız.
        self,
        device_id: int,
        alert_type: AlertType,
    ) -> Alert | None:
        result = await self.session.execute(
            select(Alert).where(
                Alert.device_id == device_id,
                Alert.alert_type == alert_type,
                Alert.is_resolved.is_(False), #Sadece çözülmemiş alarmları istiyoruz.
            ).order_by(
                Alert.created_at.desc() #En yeni alarm en üstte olacak.
            )
        )

        return result.scalars().first()

    async def resolve(  #alarmı çözülmüş olarak işaretle
        self,
        alert: Alert,
    ) -> Alert:
        alert.is_resolved = True
        alert.resolved_at = datetime.utcnow()

        await self.session.commit()

        await self.session.refresh(alert)

        return alert