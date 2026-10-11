from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device
from app.models.metrics import Metrics


class DeviceHealthRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self):
        ranked_metrics = (
            select(
                Metrics.id.label("metric_id"),
                Metrics.device_id,
                Metrics.cpu_usage,
                Metrics.ram_usage,
                Metrics.disk_total_gb,
                Metrics.disk_used_gb,
                Metrics.latency_ms,
                Metrics.packet_loss,
                Metrics.uptime_seconds,
                Metrics.timestamp.label("metric_timestamp"),
                func.row_number() #cihazları yeniden eskiye doğru sıralar.
                .over(
                    partition_by=Metrics.device_id,
                    order_by=Metrics.timestamp.desc(),
                )
                .label("row_number"),
            )
            .subquery()
        )

        query = (
            select(
                Device,
                ranked_metrics.c.cpu_usage,
                ranked_metrics.c.ram_usage,
                ranked_metrics.c.disk_total_gb,
                ranked_metrics.c.disk_used_gb,
                ranked_metrics.c.latency_ms,
                ranked_metrics.c.packet_loss,
                ranked_metrics.c.uptime_seconds,
                ranked_metrics.c.metric_timestamp,
            )
            .outerjoin(
                ranked_metrics,
                and_(
                    ranked_metrics.c.device_id == Device.id,
                    ranked_metrics.c.row_number == 1, #en yeni metric'i alıyoruz.
                ),
            )
            .where(Device.is_active.is_(True))
            .order_by(Device.id)
        )

        result = await self.session.execute(query)

        return result.all()