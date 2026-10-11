#Bu dosya, MonitoringService.check_device() fonksiyonunu tek başına çalıştırıp gerçek bir cihaz taramasının sonucunu terminalde göstermeye yarıyor.

import asyncio

from app.core.database import async_session_factory
from app.enums.device_status import DeviceStatus
from app.services.monitoring_service import MonitoringService


# Test amacıyla izlenecek cihazın ID'si.
DEVICE_ID = 3


def test_check_device():
    asyncio.run(
        _run_monitoring_test()
    )


async def _run_monitoring_test():
    async with async_session_factory() as session:
        service = MonitoringService(
            session
        )

        result = await service.check_device(
            DEVICE_ID
        )

        assert result is not None

        device = result["device"]
        metrics = result["metrics"]

        assert device.id == DEVICE_ID
        assert device.status == DeviceStatus.Online
        assert device.last_checked is not None

        assert metrics.device_id == DEVICE_ID

        assert metrics.latency_ms >= 0
        assert 0 <= metrics.packet_loss <= 100

        if metrics.cpu_usage is not None:
            assert 0 <= metrics.cpu_usage <= 100

        if metrics.ram_usage is not None:
            assert 0 <= metrics.ram_usage <= 100

        if metrics.disk_total_gb is not None:
            assert metrics.disk_total_gb > 0

        if metrics.disk_used_gb is not None:
            assert metrics.disk_used_gb >= 0

        if metrics.uptime_seconds is not None:
            assert metrics.uptime_seconds >= 0

        assert metrics.timestamp is not None