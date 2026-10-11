from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums.device_status import DeviceStatus
from app.models.device import Device


class DeviceRepository:
    def __init__(
        self,
        session: AsyncSession,
    ):
        self.session = session

    async def create(
        self,
        device: Device,  #Device nesnesi alır ve geriye bir Device nesnesi döndürür.
    ) -> Device:
        self.session.add(device)  # SQL'deki INSERT komutuyla aynı: veritabanı tablosuna yeni bir satır veya kayıt ekler ama hemen veritababnına eklemiyor veritabanına eklenmek üzere Session'a dahil edicek.

        await self.session.commit() #İşlemi kalıcı hale getir

        await self.session.refresh(device) #Bu ORM nesnesinin güncel durumunu database'den tekrar yükle.

        return device

    async def get_all(  #Tüm cihazları getiriyor.
        self,
    ) -> list[Device]:
        result = await self.session.execute(  #execute(): sorguyu çalıştırır
            select(Device).where( #select(): SQL sorgusunu oluşturur.
                Device.is_active.is_(True) #aktif cihazları getiriyor.
            )
        )

        return result.scalars().all()  #scalars(): ORM nesnelerini alır , all(): hepsini liste yapar.

    async def get_by_id( # ID'ye göre cihazı bulur.
        self,
        device_id: int,
    ) -> Device | None:  #Cihaz bulunursa Device, bulunamazsa None.
        result = await self.session.execute(
            select(Device).where(
                Device.id == device_id,
                Device.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def get_by_ip( #IP adresine sahip cihaz bulunursa Device, bulunamazsa None.
        self,
        ip_address: str,
    ) -> Device | None:
        result = await self.session.execute(
            select(Device).where(
                Device.ip_address == ip_address,
                Device.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def get_active_ids(  #aktif cihazların ID'lerini döndürmek.
        self,
    ) -> list[int]:
        result = await self.session.execute(
            select(Device.id).where(
                Device.is_active.is_(True)
            )
        )

        return list(
            result.scalars().all()
        )

    async def count_active(  #Aktif cihaz sayısını döndürmek.
        self,
    ) -> int:
        result = await self.session.execute(
            select(
                func.count(Device.id)
            ).where(
                Device.is_active.is_(True)
            )
        )

        return result.scalar_one()

    async def count_by_status(  #belirli durum'a sahip aktif cihazların sayısı.
        self,
        status: DeviceStatus,
    ) -> int:
        result = await self.session.execute(
            select(
                func.count(Device.id)
            ).where(
                Device.is_active.is_(True),
                Device.status == status,
            )
        )

        return result.scalar_one()

    async def update( #Bu Device üzerinde yapılan değişiklikleri database'e kaydet.
        self,
        device: Device,
    ) -> Device:
        await self.session.commit()

        await self.session.refresh(device)

        return device

    async def soft_delete(  #Cihaz silme işlemi.
        self,
        device: Device,
    ) -> Device:
        device.is_active = False

        await self.session.commit() #değişikliği PostgreSQL'e kaydediyor.

        await self.session.refresh(device)

        return device