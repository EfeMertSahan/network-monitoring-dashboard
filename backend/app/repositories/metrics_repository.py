from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.metrics import Metrics


class MetricsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        metrics: Metrics,
    ) -> Metrics:
        self.session.add(metrics)

        await self.session.commit()

        await self.session.refresh(metrics)

        return metrics

    async def get_by_device(
        self,
        device_id: int,
        since: datetime | None = None, #Bu zamandan sonraki kayıtları getir.
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[Metrics], int]:
        query = (
            select(Metrics) #metrics tablosundan kayıtları seç.
            .where(Metrics.device_id == device_id) #sadece ilgili cihazın kayıtlarını al.
        )

        count_query = (
            select(func.count(Metrics.id))
            .where(Metrics.device_id == device_id)
        )

        if since is not None:
            query = query.where(
                Metrics.timestamp >= since
            )

            count_query = count_query.where(
                Metrics.timestamp >= since
            )

        query = (
            query
            .order_by(Metrics.timestamp.desc())  #en yeni kayıt üstte olsun.
            .offset(offset)
            .limit(limit)
        )

        result = await self.session.execute(query)

        count_result = await self.session.execute(
            count_query
        )

        metrics = result.scalars().all()
        total = count_result.scalar_one()

        return metrics, total

    async def get_series(  #cihazın ilgili zamandan sonraki kayıtlarını getir
        self,
        device_id: int,
        since: datetime | None = None,
    ) -> list[Metrics]:
        query = (
            select(Metrics)
            .where(Metrics.device_id == device_id)
        )

        if since is not None:
            query = query.where(
                Metrics.timestamp >= since
            )

        query = query.order_by(
            Metrics.timestamp.asc()
        )

        result = await self.session.execute(query)

        return list(result.scalars().all())