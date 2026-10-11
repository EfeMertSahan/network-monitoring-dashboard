#Dashboard verisini HTTP API olarak dışarı açmak.

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.dashboard import (
    DashboardData,
    DashboardResponse,
)
from app.services.dashboard_service import DashboardService


router = APIRouter()


# Dashboard için özet monitoring verilerini getirir.
@router.get(
    "/",
    response_model=DashboardResponse,
)
async def get_dashboard(
    session: AsyncSession = Depends(get_db),
):
    service = DashboardService(session)

    summary = await service.get_summary()

    return DashboardResponse(
        success=True,
        message="Dashboard verileri başarıyla getirildi.",
        data=DashboardData(
            **summary
        ),
    )