#Veritabanındaki DeviceCredential kayıtlarını oluşturuyor, güncelliyor, getiriyor ve siliyor.

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device_credential import DeviceCredential


class DeviceCredentialRepository:
    def __init__(
        self,
        session: AsyncSession,
    ):
        self.session = session

    async def create_or_update(
        self,
        credential: DeviceCredential,
    ) -> DeviceCredential:
        result = await self.session.execute(
            select(DeviceCredential).where(
                DeviceCredential.device_id
                == credential.device_id
            )
        )

        existing = result.scalar_one_or_none()

        if existing is None:
            self.session.add(credential)
            await self.session.commit()
            await self.session.refresh(credential)

            return credential

        existing.enabled = credential.enabled
        existing.port = credential.port
        existing.username = credential.username
        existing.password_encrypted = (
            credential.password_encrypted
        )

        await self.session.commit()
        await self.session.refresh(existing)

        return existing

    async def get_by_device_id(
        self,
        device_id: int,
    ) -> DeviceCredential | None:
        result = await self.session.execute(
            select(DeviceCredential).where(
                DeviceCredential.device_id == device_id
            )
        )

        return result.scalar_one_or_none()

    async def delete(
        self,
        credential: DeviceCredential,
    ) -> None:
        await self.session.delete(credential)

        await self.session.commit()