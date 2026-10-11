#Zamanlanmış monitoring görevini başlatır ve her çalışmada aktif cihazların kontrol edilmesini sağlar.

import asyncio
from datetime import datetime, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.config import settings
from app.core.database import async_session_factory
from app.services.monitoring_service import MonitoringService
from app.utils.logger import logger


scheduler = AsyncIOScheduler()

semaphore = asyncio.Semaphore(
    settings.max_concurrent_devices  #Maksimum aynı anda kontrol edilecek cihaz sayısı ayarlanır.
)


async def monitor_device(
    device_id: int,
):
    async with semaphore:
        try:
            async with async_session_factory() as session:
                service = MonitoringService(session)

                await service.check_device(
                    device_id
                )

                logger.info(
                    f"Cihaz {device_id} için "
                    f"otomatik monitoring tamamlandı."
                )

        except asyncio.CancelledError:
            logger.info(
                f"Cihaz {device_id} için otomatik "
                f"monitoring uygulama kapanışı nedeniyle "
                f"iptal edildi."
            )

            raise

        except Exception as exc:
            logger.error(
                f"Cihaz {device_id} için otomatik "
                f"monitoring sırasında hata oluştu: "
                f"{exc}"
            )


async def scheduled_monitoring():
    async with async_session_factory() as session:
        service = MonitoringService(session)

        device_ids = (
            await service.get_active_device_ids()
        )

    tasks = [
        monitor_device(device_id)
        for device_id in device_ids
    ]

    if not tasks:
        logger.info(
            "Kontrol edilecek aktif cihaz bulunamadı."
        )

        return

    try:
        await asyncio.gather( # Birden fazla cihazı aynı anda kontrol eder ve hepsinin bitmesini bekler.
            *tasks
        )

    except asyncio.CancelledError:
        logger.info(
            "Otomatik monitoring görevi "
            "uygulama kapanışı nedeniyle iptal edildi."
        )

        raise

    logger.info(
        f"Otomatik monitoring görevi tamamlandı. "
        f"Kontrol edilen cihaz sayısı: "
        f"{len(device_ids)}"
    )


def start_scheduler():
    # İlk monitoring uygulama açılır açılmaz değil, mevcut interval kadar bekledikten sonra başlar.
    first_run = (
        datetime.now()
        + timedelta(
            seconds=settings.monitoring_interval_seconds
        )
    )

    scheduler.add_job(
        scheduled_monitoring,
        trigger="interval", #Görevi belirli zaman aralıklarında çalıştır.
        seconds=settings.monitoring_interval_seconds,  #30 saniyede bir otomatik olarak çalışacak(ping atıcak).
        id="monitoring_job", #Bu görevin benzersiz ID'si.
        replace_existing=True, #Aynı ID'li job daha önce varsa tekrar eklemek yerine mevcut job'ı yenile.
        max_instances=1, # Aynı monitoring görevinin üst üste çalışmasını engeller.
        coalesce=True, # Kaçırılan görevleri tek çalışmada birleştirir.
        next_run_time=first_run, #Görevin ilk bağlanması.
    )

    scheduler.start()

    logger.info(
        "Monitoring scheduler başlatıldı. "
        f"İlk çalışma yaklaşık "
        f"{settings.monitoring_interval_seconds} saniye "
        f"sonra yapılacak."
    )


def stop_scheduler():
    scheduler.pause()

    scheduler.shutdown(
        wait=True
    )

    logger.info(
        "Monitoring scheduler durduruldu."
    )