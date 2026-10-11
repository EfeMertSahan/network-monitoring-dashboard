from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device
from app.repositories.device_repository import DeviceRepository
from app.schemas.device import (
    DeviceCreate,
    DeviceUpdate,
)


class DuplicateIPAddressError(Exception): # Aynı IP adresinin birden fazla aktif cihaza verilmesini belirten özel hata sınıfı.
    pass

#Service'e verilen Session, Repository'ye aktarılıyor.
class DeviceService:
    def __init__(
        self,
        session: AsyncSession,
    ):
        self.repository = DeviceRepository(
            session
        )

    async def create( #yeni cihaz oluştur
        self,
        device_data: DeviceCreate,
    ) -> Device:
        ip_address = str(
            device_data.ip_address
        )

        existing_device = (
            await self.repository.get_by_ip(
                ip_address
            )
        )

        if existing_device is not None:
            raise DuplicateIPAddressError(
                "IP adresi başka bir aktif cihaza ait."
            )

        device = Device(
            hostname=device_data.hostname,
            ip_address=ip_address,
            device_type=device_data.device_type,
            location=device_data.location,
        )

        try:
            return await self.repository.create( #oluşturduğumuz SQLAlchemy nesnesini Repository'ye göndereceğiz.
                device
            )

        except IntegrityError: # Veritabanı kısıtlaması ihlal edildiğinde hatayı yakalar.
            await self.repository.session.rollback()

            raise DuplicateIPAddressError(
                "IP adresi başka bir aktif cihaza ait."
            )

    async def get_all( #Aktif cihazların tamamını getirir.
        self,
    ) -> list[Device]:
        return await self.repository.get_all()

    async def get_by_id(  #Tek cihaz getirir.
        self,
        device_id: int,
    ) -> Device | None:
        return await self.repository.get_by_id(
            device_id
        )

    async def update(  #Cihazda değişiklik(güncelleme) yapılırsa kullanılır.
        self,
        device_id: int,
        device_data: DeviceUpdate,
    ) -> Device | None:
        device = await self.repository.get_by_id(
            device_id
        )

        if device is None:
            return None

        new_ip_address = str(
            device_data.ip_address
        )

        existing_device = (
            await self.repository.get_by_ip(
                new_ip_address
            )
        )

        if (
            existing_device is not None
            and existing_device.id != device.id
        ):
            raise DuplicateIPAddressError(
                "IP adresi başka bir aktif cihaza ait."
            )

        device.hostname = device_data.hostname
        device.ip_address = new_ip_address
        device.device_type = (
            device_data.device_type
        )
        device.location = device_data.location

        try:
            return await self.repository.update(
                device
            )

        except IntegrityError:
            await self.repository.session.rollback()

            raise DuplicateIPAddressError(
                "IP adresi başka bir aktif cihaza ait."
            )

    async def soft_delete(  #Cihaz silinirse(cihazın geçmiş kayıtlarını kaybetmeden) kullanılır.
        self,
        device_id: int,
    ) -> bool:
        device = await self.repository.get_by_id(
            device_id
        )

        if device is None:
            return False

        await self.repository.soft_delete(
            device
        )

        return True

    async def get_status( #cihazın sadece durum bilgisini verir.
        self,
        device_id: int,
    ) -> dict | None:
        device = await self.repository.get_by_id(
            device_id
        )

        if device is None:
            return None

        return {
            "device_id": device.id,
            "hostname": device.hostname,
            "status": device.status,
            "last_checked": device.last_checked,
        }