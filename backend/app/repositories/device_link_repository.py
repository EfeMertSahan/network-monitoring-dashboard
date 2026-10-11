#Veritabanındaki device_links işlemlerini yapacak.

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device_link import DeviceLink


class DeviceLinkRepository:
    def __init__(
        self,
        session: AsyncSession,
    ):
        self.session = session

    async def create(
        self,
        link: DeviceLink,
    ) -> DeviceLink:
        self.session.add(link)

        await self.session.commit()
        await self.session.refresh(link)

        return link

    async def get_all(
        self,
    ) -> list[DeviceLink]:
        result = await self.session.execute(
            select(DeviceLink).order_by(
                DeviceLink.id.asc()
            )
        )

        return list(
            result.scalars().all()
        )

    async def get_by_id(
        self,
        link_id: int,
    ) -> DeviceLink | None:
        result = await self.session.execute(
            select(DeviceLink).where(
                DeviceLink.id == link_id
            )
        )

        return result.scalar_one_or_none()

    async def delete(
        self,
        link: DeviceLink,
    ) -> None:
        await self.session.delete(link)
        await self.session.commit()