from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.device import (
    DeviceCreate,
    DeviceCreateResponse,
    DeviceListResponse,
    DeviceResponse,
    DeviceStatusAPIResponse,
    DeviceStatusResponse,
    DeviceUpdate,
)
from app.schemas.device_credential import (
    DeviceCredentialCreate,
    DeviceCredentialResponse,
)
from app.schemas.device_health import (
    DeviceHealthListResponse,
)
from app.services.device_credential_service import (
    DeviceCredentialService,
)
from app.services.device_health_service import (
    DeviceHealthService,
)
from app.services.device_service import (
    DeviceService,
    DuplicateIPAddressError,
)


router = APIRouter()


#Bu endpoint artık POST(Yeni veri oluşturmak) isteği geldiğinde çalışacak.
@router.post(
    "/",
    response_model=DeviceCreateResponse,
    status_code=201,
)
async def create_device(
    device: DeviceCreate,
    session: AsyncSession = Depends(get_db),
):
    service = DeviceService(session)

    try:
        created_device = await service.create(
            device
        )

    except DuplicateIPAddressError as exc:
        raise HTTPException(
            status_code=409,
            detail=str(exc),
        )

    return DeviceCreateResponse(
        success=True,
        message="Cihaz başarıyla oluşturuldu.",
        data=created_device,
    )


##Bu endpoint artık GET(cihazları getir) isteği geldiğinde çalışacak. Aktif cihazları listeler.
@router.get(
    "/",
    response_model=DeviceListResponse,
)
async def get_devices(
    session: AsyncSession = Depends(get_db),
):
    service = DeviceService(session)

    devices = await service.get_all()

    return DeviceListResponse(
        success=True,
        message="Cihazlar başarıyla getirildi.",
        data=devices,
    )


##Bu endpoint artık GET(cihazların sağlık verilerini getir) isteği geldiğinde çalışacak.
@router.get(
    "/health",
    response_model=DeviceHealthListResponse,
)
async def get_device_health(
    session: AsyncSession = Depends(get_db),
):
    service = DeviceHealthService(session)

    devices = await service.get_all()

    return DeviceHealthListResponse(
        success=True,
        message="Cihaz sağlık verileri başarıyla getirildi.",
        data=devices,
    )


#İstenilen cihaz getirilir eğer yoksa 404 hatası verilir.
@router.get(
    "/{device_id}",
    response_model=DeviceResponse,
)
async def get_device(
    device_id: int,
    session: AsyncSession = Depends(get_db),
):
    service = DeviceService(session)

    device = await service.get_by_id(
        device_id
    )

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Cihaz bulunamadı.",
        )

    return device


#Bu endpoint artık PUT(tamamen güncelleme) isteği geldiğinde çalışacak.
@router.put(
    "/{device_id}",
    response_model=DeviceResponse,
)
async def update_device(
    device_id: int,
    device_data: DeviceUpdate,
    session: AsyncSession = Depends(get_db),
):
    service = DeviceService(session)

    try:
        device = await service.update(
            device_id,
            device_data,
        )

    except DuplicateIPAddressError as exc:
        raise HTTPException(
            status_code=409,
            detail=str(exc),
        )

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Cihaz bulunamadı.",
        )

    return device


# Bu endpoint cihazın mevcut durum bilgilerini getirir.
@router.get(
    "/{device_id}/status",
    response_model=DeviceStatusAPIResponse,
)
async def get_device_status(
    device_id: int,
    session: AsyncSession = Depends(get_db),
):
    service = DeviceService(session)

    result = await service.get_status(
        device_id
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Cihaz bulunamadı.",
        )

    return DeviceStatusAPIResponse(
        success=True,
        message="Cihaz durumu başarıyla getirildi.",
        data=DeviceStatusResponse(
            device_id=result["device_id"],
            hostname=result["hostname"],
            status=result["status"],
            last_checked=result["last_checked"],
        ),
    )


# Cihazın SSH bağlantı bilgilerini oluşturur veya mevcut bilgileri günceller.
@router.put(
    "/{device_id}/ssh-credentials",
    response_model=DeviceCredentialResponse,
)
async def create_or_update_ssh_credentials(
    device_id: int,
    credential_data: DeviceCredentialCreate,
    session: AsyncSession = Depends(get_db),
):
    device_service = DeviceService(session)

    device = await device_service.get_by_id(
        device_id
    )

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Cihaz bulunamadı.",
        )

    credential_service = DeviceCredentialService(
        session
    )

    return await credential_service.create_or_update(
        device_id,
        credential_data,
    )


# Cihazın SSH bağlantı bilgilerini getirir.
# Şifre API response içinde gönderilmez.
@router.get(
    "/{device_id}/ssh-credentials",
    response_model=DeviceCredentialResponse,
)
async def get_ssh_credentials(
    device_id: int,
    session: AsyncSession = Depends(get_db),
):
    device_service = DeviceService(session)

    device = await device_service.get_by_id(
        device_id
    )

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Cihaz bulunamadı.",
        )

    credential_service = DeviceCredentialService(
        session
    )

    credential = (
        await credential_service.get_by_device_id(
            device_id
        )
    )

    if credential is None:
        raise HTTPException(
            status_code=404,
            detail="SSH bilgileri bulunamadı.",
        )

    return credential


# Cihazın SSH bağlantı bilgilerini siler.
@router.delete(
    "/{device_id}/ssh-credentials",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_ssh_credentials(
    device_id: int,
    session: AsyncSession = Depends(get_db),
):
    device_service = DeviceService(session)

    device = await device_service.get_by_id(
        device_id
    )

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Cihaz bulunamadı.",
        )

    credential_service = DeviceCredentialService(
        session
    )

    deleted = await credential_service.delete(
        device_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="SSH bilgileri bulunamadı.",
        )

    return None


#Bu endpoint artık DELETE(Sil) isteği geldiğinde çalışacak.
@router.delete(
    "/{device_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_device(
    device_id: int,
    session: AsyncSession = Depends(get_db),
):
    service = DeviceService(session)

    deleted = await service.soft_delete(
        device_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Cihaz bulunamadı.",
        )

    return None