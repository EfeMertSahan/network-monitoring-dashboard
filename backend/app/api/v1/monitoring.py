#Monitoring HTTP endpoint'leri

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.enums.metric_period import MetricPeriod
from app.schemas.device import DeviceResponse
from app.schemas.metrics import (
    MetricsListResponse,
    MetricsPaginatedResponse,
    MetricsResponse,
)
from app.schemas.monitoring import ScanData, ScanResponse
from app.services.metrics_service import MetricsService
from app.services.monitoring_service import MonitoringService


router = APIRouter()


@router.post(  #cihazı ping'le ve yeni metric oluştur
    "/devices/{device_id}/scan",
    response_model=ScanResponse,
)
async def scan_device(
    device_id: int,
    session: AsyncSession = Depends(get_db),
):
    service = MonitoringService(session)

    result = await service.check_device(device_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Cihaz bulunamadı.",
        )

    return ScanResponse(
        success=True,
        message="Cihaz taraması başarıyla tamamlandı.",
        data=ScanData(
            device=DeviceResponse.model_validate(
                result["device"]
            ),
            metrics=MetricsResponse.model_validate(
                result["metrics"]
            ),
        ),
    )


@router.get(  #cihazın geçmiş metric kayıtlarını getir
    "/devices/{device_id}/metrics",
    response_model=MetricsPaginatedResponse,
)
async def get_device_metrics(
    device_id: int,
    last: MetricPeriod | None = Query(
        default=None,
        description="Zaman filtresi: 1h, 6h, 24h veya 7d",
    ),
    page: int = Query(  #page en az 1 olabilir.
        default=1,
        ge=1,
    ),
    limit: int = Query(  #limit 1 ile 100 arasında olabilir.
        default=20,
        ge=1,
        le=100,
    ),
    session: AsyncSession = Depends(get_db),
):
    service = MetricsService(session)

    metrics, total, total_pages = await service.get_by_device(
        device_id,
        last,
        page,
        limit,
    )

    return MetricsPaginatedResponse(
        success=True,
        message="Cihaz metrikleri başarıyla getirildi.",
        data=metrics,
        page=page,
        limit=limit,
        total=total,
        total_pages=total_pages,
    )


@router.get(
    "/devices/{device_id}/metrics/series",
    response_model=MetricsListResponse,
)
async def get_device_metrics_series(
    device_id: int,
    last: MetricPeriod | None = Query(
        default=MetricPeriod.OneHour,
        description="Grafik zaman filtresi: 1h, 6h, 24h veya 7d",
    ),
    session: AsyncSession = Depends(get_db),
):
    service = MetricsService(session)

    metrics = await service.get_series(
        device_id,
        last,
    )

    return MetricsListResponse(
        success=True,
        message="Grafik metrikleri başarıyla getirildi.",
        data=metrics,
    )