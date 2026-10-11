#Burada iş kuralları olacak.

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device_link import DeviceLink
from app.repositories.device_link_repository import (
    DeviceLinkRepository,
)
from app.repositories.device_repository import (
    DeviceRepository,
)
from app.schemas.device_link import (
    DeviceLinkCreate,
)


class DeviceLinkService:
    def __init__(
        self,
        session: AsyncSession,
    ):
        self.repository = DeviceLinkRepository(
            session
        )

        self.device_repository = (
            DeviceRepository(session)
        )

    async def create(
        self,
        data: DeviceLinkCreate,
    ) -> DeviceLink:
        if (
            data.source_device_id
            == data.target_device_id
        ):
            raise ValueError(
                "Bir cihaz kendisiyle bağlantılı olamaz."
            )

        source_device = (
            await self.device_repository.get_by_id(
                data.source_device_id
            )
        )

        if source_device is None:
            raise LookupError(
                "Kaynak cihaz bulunamadı."
            )

        target_device = (
            await self.device_repository.get_by_id(
                data.target_device_id
            )
        )

        if target_device is None:
            raise LookupError(
                "Hedef cihaz bulunamadı."
            )

        existing_links = (
            await self.repository.get_all()
        )

        for existing_link in existing_links:
            same_direction = (
                existing_link.source_device_id
                == data.source_device_id
                and existing_link.target_device_id
                == data.target_device_id
            )

            reverse_direction = (
                existing_link.source_device_id
                == data.target_device_id
                and existing_link.target_device_id
                == data.source_device_id
            )

            if (
                same_direction
                or reverse_direction
            ):
                raise ValueError(
                    "Bu iki cihaz arasında zaten bir bağlantı bulunuyor."
                )

        link = DeviceLink(
            source_device_id=data.source_device_id,
            target_device_id=data.target_device_id,
            link_type=data.link_type,
            status=data.status,
        )

        return await self.repository.create(
            link
        )

    async def get_all(
        self,
    ) -> list[DeviceLink]:
        return await self.repository.get_all()

    async def delete(
        self,
        link_id: int,
    ) -> bool:
        link = (
            await self.repository.get_by_id(
                link_id
            )
        )

        if link is None:
            return False

        await self.repository.delete(
            link
        )

        return True