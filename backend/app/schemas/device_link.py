#Frontend/API'nin hangi bağlantı bilgilerini göndereceğini ve alacağını belirler.

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


LinkType = Literal[
    "ethernet",
    "fiber",
    "wireless",
    "vpn",
    "other",
]

LinkStatus = Literal[
    "up",  #bağlantı aktif / çalışıyor
    "down", #bağlantı kapalı / çalışmıyor
    "unknown", #bağlantının durumu bilinmiyor
]


class DeviceLinkCreate(BaseModel):
    source_device_id: int = Field(
        ge=1
    )

    target_device_id: int = Field(
        ge=1
    )

    link_type: LinkType = "ethernet"

    status: LinkStatus = "up"


class DeviceLinkResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    source_device_id: int
    target_device_id: int
    link_type: str
    status: str
    created_at: datetime
    updated_at: datetime


class DeviceLinkListResponse(BaseModel):
    success: bool
    message: str
    data: list[DeviceLinkResponse]