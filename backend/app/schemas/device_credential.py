#API'ye gelen ve API'den dönen SSH credential verilerinin formatını belirliyor.

from datetime import datetime
from typing import Annotated

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    SecretStr,
    StringConstraints,
)


class DeviceCredentialCreate(BaseModel):
    enabled: bool = True

    port: int = Field(
        default=22,
        ge=1,
        le=65535,
    )

    username: Annotated[
        str,
        StringConstraints(
            strip_whitespace=True,
            min_length=1,
            max_length=100,
        ),
    ]

    password: SecretStr


class DeviceCredentialResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    device_id: int
    enabled: bool
    port: int
    username: str
    created_at: datetime
    updated_at: datetime