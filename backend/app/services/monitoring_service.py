#Ping, SSH, sistem metrikleri ve alarm iş mantığını bir arada koordine etmek.

import asyncio
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.collectors.ping_collector import check_host
from app.collectors.ssh_collector import execute_commands
from app.collectors.system_collector import parse_system_metrics
from app.core.config import settings
from app.enums.alert_level import AlertLevel
from app.enums.alert_type import AlertType
from app.enums.device_status import DeviceStatus
from app.models.metrics import Metrics
from app.repositories.device_repository import DeviceRepository
from app.repositories.metrics_repository import MetricsRepository
from app.services.alert_service import AlertService
from app.services.device_credential_service import (
    DeviceCredentialService,
)
from app.utils.logger import logger


class MonitoringService:
    def __init__(
        self,
        session: AsyncSession,
    ):
        self.device_repository = DeviceRepository(
            session
        )

        self.metrics_repository = MetricsRepository(
            session
        )

        self.alert_service = AlertService(
            session
        )

        self.credential_service = (
            DeviceCredentialService(session)
        )

    async def get_active_device_ids(
        self,
    ) -> list[int]:
        return await self.device_repository.get_active_ids()

    async def collect_system_metrics(
        self,
        device_id: int,
        ip_address: str,
    ):
        connection_data = (
            await self.credential_service.get_connection_data(
                device_id
            )
        )

        if connection_data is None:
            logger.warning(
                f"Cihaz için aktif SSH bilgileri bulunamadı. "
                f"Cihaz ID: {device_id}"
            )

            return None

        commands = [
            "cat /proc/stat | head -n 1",
            "free -m",
            "df -k /",
            "cat /proc/uptime",
        ]

        try:
            command_results_1 = await asyncio.to_thread(
                execute_commands,
                ip_address,
                connection_data["username"],
                connection_data["password"],
                commands,
                connection_data["port"],
                settings.ssh_timeout,
                settings.ssh_retries,
            )

        except Exception as exc:
            logger.error(
                f"SSH sistem metrikleri alınamadı. "
                f"Cihaz ID: {device_id}, "
                f"Hata: {exc}"
            )

            return None

        cpu_snapshot_1 = command_results_1.get(
            "cat /proc/stat | head -n 1"
        )

        ram_output = command_results_1.get(
            "free -m"
        )

        disk_output = command_results_1.get(
            "df -k /"
        )

        uptime_output = command_results_1.get(
            "cat /proc/uptime"
        )

        if cpu_snapshot_1 is None:
            logger.warning(
                f"CPU ilk ölçümü alınamadı. "
                f"Cihaz ID: {device_id}"
            )

            return None

        if ram_output is None:
            logger.warning(
                f"RAM bilgisi alınamadı. "
                f"Cihaz ID: {device_id}"
            )

            return None

        if disk_output is None:
            logger.warning(
                f"Disk bilgisi alınamadı. "
                f"Cihaz ID: {device_id}"
            )

            return None

        if uptime_output is None:
            logger.warning(
                f"Uptime bilgisi alınamadı. "
                f"Cihaz ID: {device_id}"
            )

            return None

        await asyncio.sleep(1)

        try:
            command_results_2 = await asyncio.to_thread(
                execute_commands,
                ip_address,
                connection_data["username"],
                connection_data["password"],
                [
                    "cat /proc/stat | head -n 1"
                ],
                connection_data["port"],
                settings.ssh_timeout,
                settings.ssh_retries,
            )

        except Exception as exc:
            logger.error(
                f"CPU ikinci ölçümü alınamadı. "
                f"Cihaz ID: {device_id}, "
                f"Hata: {exc}"
            )

            return None

        cpu_snapshot_2 = command_results_2.get(
            "cat /proc/stat | head -n 1"
        )

        if cpu_snapshot_2 is None:
            logger.warning(
                f"CPU ikinci ölçümü alınamadı. "
                f"Cihaz ID: {device_id}"
            )

            return None

        return parse_system_metrics(
            cpu_snapshot_1=cpu_snapshot_1,
            cpu_snapshot_2=cpu_snapshot_2,
            ram_output=ram_output,
            disk_output=disk_output,
            uptime_output=uptime_output,
        )

    async def check_system_alerts(
        self,
        device_id: int,
        cpu_usage: int | None,
        ram_usage: int | None,
        disk_total_gb: int | None,
        disk_used_gb: int | None,
    ):
        if cpu_usage is not None:
            if (
                cpu_usage
                > settings.high_cpu_threshold_percent
            ):
                await self.alert_service.create_if_needed(
                    device_id=device_id,
                    alert_type=AlertType.HighCPU,
                    level=AlertLevel.Warning,
                    message="Cihaz CPU kullanımı yüksek.",
                )

            else:
                await self.alert_service.resolve_open_by_device(
                    device_id,
                    AlertType.HighCPU,
                )

        if ram_usage is not None:
            if (
                ram_usage
                > settings.high_ram_threshold_percent
            ):
                await self.alert_service.create_if_needed(
                    device_id=device_id,
                    alert_type=AlertType.HighRAM,
                    level=AlertLevel.Warning,
                    message="Cihaz RAM kullanımı yüksek.",
                )

            else:
                await self.alert_service.resolve_open_by_device(
                    device_id,
                    AlertType.HighRAM,
                )

        if (
            disk_total_gb is not None
            and disk_used_gb is not None
            and disk_total_gb > 0
        ):
            disk_usage_percent = (
                disk_used_gb
                / disk_total_gb
            ) * 100

            if (
                disk_usage_percent
                > settings.high_disk_threshold_percent
            ):
                await self.alert_service.create_if_needed(
                    device_id=device_id,
                    alert_type=AlertType.HighDisk,
                    level=AlertLevel.Warning,
                    message="Cihaz disk kullanımı yüksek.",
                )

            else:
                await self.alert_service.resolve_open_by_device(
                    device_id,
                    AlertType.HighDisk,
                )

    async def check_device(
        self,
        device_id: int,
    ):
        device = await self.device_repository.get_by_id(
            device_id
        )

        if device is None:
            return None

        result = await asyncio.to_thread(  #check_host() senkron(eş zamanlı olarak ping atılacak) bir fonksiyon. Bunu ayrı bir thread'de çalıştır, bitince sonucu bana async olarak döndür.
            check_host,
            str(device.ip_address),
            settings.ping_count,
            settings.ping_timeout,
        )

        device.last_checked = (  #cihazın son kontrol zamanını kaydediyor.
            datetime.now(UTC).replace(tzinfo=None)
        )

        if not result.is_alive:
            device.status = DeviceStatus.Offline

            await self.alert_service.create_if_needed(
                device_id=device.id,
                alert_type=AlertType.Offline,
                level=AlertLevel.Critical,
                message="Cihaz erişilemiyor.",
            )

        else:
            device.status = DeviceStatus.Online

            await self.alert_service.resolve_open_by_device(
                device.id,
                AlertType.Offline,
            )

            if (
                result.latency_ms
                > settings.high_latency_threshold_ms
            ):
                await self.alert_service.create_if_needed(
                    device_id=device.id,
                    alert_type=AlertType.HighLatency,
                    level=AlertLevel.Warning,
                    message="Cihaz gecikme değeri yüksek.",
                )

            else:
                await self.alert_service.resolve_open_by_device(
                    device.id,
                    AlertType.HighLatency,
                )

            if (
                result.packet_loss
                > settings.high_packet_loss_threshold_percent
            ):
                await self.alert_service.create_if_needed(
                    device_id=device.id,
                    alert_type=AlertType.HighPacketLoss,
                    level=AlertLevel.Warning,
                    message="Paket kaybı oranı yüksek.",
                )

            else:
                await self.alert_service.resolve_open_by_device(
                    device.id,
                    AlertType.HighPacketLoss,
                )

        system_metrics = None

        if result.is_alive:
            system_metrics = (
                await self.collect_system_metrics(
                    device_id=device.id,
                    ip_address=str(device.ip_address),
                )
            )

        if system_metrics is not None:
            await self.check_system_alerts(
                device_id=device.id,
                cpu_usage=system_metrics.cpu_usage,
                ram_usage=system_metrics.ram_usage,
                disk_total_gb=system_metrics.disk_total_gb,
                disk_used_gb=system_metrics.disk_used_gb,
            )

        device = await self.device_repository.update(
            device
        )

        metrics = Metrics(
            device_id=device.id,
            cpu_usage=(
                system_metrics.cpu_usage
                if system_metrics is not None
                else None
            ),
            ram_usage=(
                system_metrics.ram_usage
                if system_metrics is not None
                else None
            ),
            disk_total_gb=(
                system_metrics.disk_total_gb
                if system_metrics is not None
                else None
            ),
            disk_used_gb=(
                system_metrics.disk_used_gb
                if system_metrics is not None
                else None
            ),
            latency_ms=result.latency_ms,
            packet_loss=result.packet_loss,
            uptime_seconds=(
                system_metrics.uptime_seconds
                if system_metrics is not None
                else None
            ),
            timestamp=(
                datetime.now(UTC).replace(tzinfo=None)
            ),
        )

        metrics = await self.metrics_repository.create(
            metrics
        )

        return {
            "device": device,
            "metrics": metrics,
        }