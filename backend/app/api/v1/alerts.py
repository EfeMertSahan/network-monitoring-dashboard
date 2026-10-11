#Bu dosya Alert sisteminin dış dünyaya açılan kapısı olacak.

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.enums.alert_level import AlertLevel
from app.enums.alert_type import AlertType
from app.schemas.alert import (
    AlertAPIResponse,
    AlertCreate,
    AlertPaginatedResponse,
    AlertResponse,
)
from app.services.alert_service import AlertService


router = APIRouter()


# Tüm alarm kayıtlarını filtreli ve sayfalı olarak getirir.
@router.get(
    "/",
    response_model=AlertPaginatedResponse,
)
async def get_alerts(
    is_resolved: bool | None = Query(
        default=None,
        description="true: çözülenler, false: açık olanlar",
    ),
    level: AlertLevel | None = Query(
        default=None,
        description="Alarm seviyesi",
    ),
    alert_type: AlertType | None = Query(
        default=None,
        description="Alarm türü",
    ),
    device_id: int | None = Query(
        default=None,
        ge=1,
        description="Belirli bir cihazın alarmlarını getirir",
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    session: AsyncSession = Depends(get_db),
):
    service = AlertService(session)

    alerts, total, total_pages = await service.get_all(
        is_resolved=is_resolved,
        level=level,
        alert_type=alert_type,
        device_id=device_id,
        page=page,
        limit=limit,
    )

    return AlertPaginatedResponse(
        success=True,
        message="Uyarılar başarıyla getirildi.",
        data=[
            AlertResponse.model_validate(alert)
            for alert in alerts
        ],
        page=page,
        limit=limit,
        total=total,
        total_pages=total_pages,
    )


# Belirli bir alarm kaydını getirir.
@router.get(
    "/{alert_id}",
    response_model=AlertAPIResponse,
)
async def get_alert(
    alert_id: int,
    session: AsyncSession = Depends(get_db),
):
    service = AlertService(session)

    alert = await service.get_by_id(
        alert_id
    )

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Uyarı bulunamadı.",
        )

    return AlertAPIResponse(
        success=True,
        message="Uyarı başarıyla getirildi.",
        data=AlertResponse.model_validate(
            alert
        ),
    )


# Geliştirme ve test amacıyla manuel alarm oluşturur.
@router.post(
    "/test",
    response_model=AlertAPIResponse,
    status_code=201,
)
async def create_test_alert(
    alert_data: AlertCreate,
    session: AsyncSession = Depends(get_db),
):
    service = AlertService(session)

    alert = await service.create(
        alert_data
    )

    return AlertAPIResponse(
        success=True,
        message="Test uyarısı başarıyla oluşturuldu.",
        data=AlertResponse.model_validate(
            alert
        ),
    )


# Belirli bir alarmı çözüldü olarak işaretler.
@router.put(
    "/{alert_id}/resolve",
    response_model=AlertAPIResponse,
)
async def resolve_alert(
    alert_id: int,
    session: AsyncSession = Depends(get_db),
):
    service = AlertService(session)

    alert = await service.resolve(
        alert_id
    )

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Uyarı bulunamadı.",
        )

    return AlertAPIResponse(
        success=True,
        message="Uyarı başarıyla çözüldü.",
        data=AlertResponse.model_validate(
            alert
        ),
    )