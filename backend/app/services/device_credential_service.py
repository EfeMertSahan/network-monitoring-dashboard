#Bu dosya, cihazların SSH kimlik bilgilerinin iş mantığını yönetir.
#Veritabanı işlemleri DeviceCredentialRepository, şifreleme işlemleri ise app.core.security tarafından yapılır.

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decrypt_secret, encrypt_secret
from app.models.device_credential import DeviceCredential
from app.repositories.device_credential_repository import (
    DeviceCredentialRepository,
)
from app.schemas.device_credential import (
    DeviceCredentialCreate,
    DeviceCredentialResponse,
)


class DeviceCredentialService:
    def __init__(self, session: AsyncSession):
        self.repository = DeviceCredentialRepository(session)

    async def create_or_update(
        self,
        device_id: int,
        credential_data: DeviceCredentialCreate,
    ) -> DeviceCredentialResponse:
        encrypted_password = encrypt_secret(
            credential_data.password.get_secret_value()
        )

        credential = DeviceCredential(
            device_id=device_id,
            enabled=credential_data.enabled,
            port=credential_data.port,
            username=credential_data.username,
            password_encrypted=encrypted_password,
        )

        saved_credential = await self.repository.create_or_update(
            credential
        )

        return DeviceCredentialResponse.model_validate(
            saved_credential
        )

    async def get(
        self,
        device_id: int,
    ) -> DeviceCredentialResponse | None:
        credential = await self.repository.get_by_device_id(device_id)

        if credential is None:
            return None

        return DeviceCredentialResponse.model_validate(
            credential
        )

    async def delete(self, device_id: int) -> bool:
        credential = await self.repository.get_by_device_id(device_id)

        if credential is None:
            return False

        await self.repository.delete(credential)
        return True

    async def get_connection_data(
        self,
        device_id: int,
    ) -> dict[str, int | str] | None:
        credential = await self.repository.get_by_device_id(device_id)

        if credential is None or not credential.enabled:
            return None

        return {
            "port": credential.port,
            "username": credential.username,
            "password": decrypt_secret(
                credential.password_encrypted
            ),
        }