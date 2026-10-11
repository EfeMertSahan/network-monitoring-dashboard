from datetime import datetime, timedelta
from math import ceil

from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.metric_period import MetricPeriod
from app.repositories.metrics_repository import MetricsRepository
from app.schemas.metrics import MetricsResponse


class MetricsService: #API'den gelen zaman filtresini gerçek zaman hesabına çevirir.
    def __init__(self, session: AsyncSession):
        self.repository = MetricsRepository(session)

    @staticmethod
    def _get_since(
        last: MetricPeriod | None,
    ) -> datetime | None:
        if last == MetricPeriod.OneHour:
            return datetime.utcnow() - timedelta(hours=1) #şu anki UTC zamandan geriye doğru 1 saatlik kayıtları getirecek.

        if last == MetricPeriod.SixHours:
            return datetime.utcnow() - timedelta(hours=6)

        if last == MetricPeriod.TwentyFourHours:
            return datetime.utcnow() - timedelta(hours=24)

        if last == MetricPeriod.SevenDays:
            return datetime.utcnow() - timedelta(days=7)

        return None

    async def get_by_device(
        self,
        device_id: int,
        last: MetricPeriod | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[MetricsResponse], int, int]:
        since = self._get_since(last)

        offset = (page - 1) * limit

        metrics, total = await self.repository.get_by_device(
            device_id,
            since,
            offset,
            limit,
        )

        response_data = [
            MetricsResponse.model_validate(metric)
            for metric in metrics
        ]

        total_pages = ceil(total / limit) if total > 0 else 0

        return response_data, total, total_pages

    async def get_series(
        self,
        device_id: int,
        last: MetricPeriod | None = None,
        max_points: int = 600,
    ) -> list[MetricsResponse]:
        since = self._get_since(last)

        metrics = await self.repository.get_series(
            device_id,
            since,
        )

        response_data = [
            MetricsResponse.model_validate(metric)
            for metric in metrics
        ]

        if len(response_data) <= max_points:
            return response_data

        step = ceil(
            len(response_data) / max_points
        )

        sampled_data = response_data[::step]

        if (
            sampled_data
            and sampled_data[-1].id != response_data[-1].id
        ):
            sampled_data.append(response_data[-1])

        return sampled_data