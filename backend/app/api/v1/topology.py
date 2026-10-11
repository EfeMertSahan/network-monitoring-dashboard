#Frontend'in topology verisine erişeceği HTTP endpoint'lerini oluşturacak.

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.device_link import (
    DeviceLinkCreate,
    DeviceLinkListResponse,
    DeviceLinkResponse,
)
from app.services.device_link_service import (
    DeviceLinkService,
)


router = APIRouter()


@router.get(
    "/links",
    response_model=DeviceLinkListResponse,
)
async def get_topology_links(
    session: AsyncSession = Depends(
        get_db
    ),
):
    service = DeviceLinkService(
        session
    )

    links = await service.get_all()

    return DeviceLinkListResponse(
        success=True,
        message="Topology bağlantıları başarıyla getirildi.",
        data=[
            DeviceLinkResponse.model_validate(
                link
            )
            for link in links
        ],
    )


@router.post(
    "/links",
    response_model=DeviceLinkResponse,
    status_code=201,
)
async def create_topology_link(
    link_data: DeviceLinkCreate,
    session: AsyncSession = Depends(
        get_db
    ),
):
    service = DeviceLinkService(
        session
    )

    try:
        link = await service.create(
            link_data
        )

    except LookupError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=409,
            detail=str(exc),
        )

    return DeviceLinkResponse.model_validate(
        link
    )


@router.delete(
    "/links/{link_id}",
    status_code=204,
)
async def delete_topology_link(
    link_id: int,
    session: AsyncSession = Depends(
        get_db
    ),
):
    service = DeviceLinkService(
        session
    )

    deleted = await service.delete(
        link_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Topology bağlantısı bulunamadı.",
        )

    return None