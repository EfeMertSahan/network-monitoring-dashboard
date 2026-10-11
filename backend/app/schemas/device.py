from datetime import datetime
# created_at ve last_checked datetime tipinde olacak

from pydantic import BaseModel, ConfigDict, Field, IPvAnyAddress
# Veri doğrulama (Validation) ve veri serileştirme (Serialization) kütüphanesi.
# IP için hazır doğrulama kütüphanesi.
# Field: Bu alan sadece veri tipiyle yetinmesin, ek kuralları da olsun.

from app.enums.device_status import DeviceStatus
from app.enums.device_type import DeviceType


# Yeni cihaz oluşturma isteği.
class DeviceCreate(BaseModel):
    hostname: str = Field(
        min_length=6,  #minimum 6 karakterli olmalı
        max_length=50, #maximum 50 karakterli olmalı
        strip_whitespace=True  # boşluklar silinmelidir
    )

    ip_address: IPvAnyAddress

    device_type: DeviceType

    location: str = Field(
        min_length=2,
        max_length=50,
        strip_whitespace=True
    )


# Cihaz güncelleme isteği.
class DeviceUpdate(BaseModel):
    hostname: str = Field(
        min_length=6,
        max_length=50,
        strip_whitespace=True
    )

    ip_address: IPvAnyAddress

    device_type: DeviceType

    location: str = Field(
        min_length=2,
        max_length=50,
        strip_whitespace=True
    )


# Server → Client oluşturulacak cevap.
class DeviceResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    hostname: str
    ip_address: IPvAnyAddress
    device_type: DeviceType
    status: DeviceStatus
    location: str
    created_at: datetime
    last_checked: datetime | None


# Cihaz oluşturma işleminin sonucunu ve oluşturulan cihazı döndürür.
class DeviceCreateResponse(BaseModel):
    success: bool
    message: str
    data: DeviceResponse  #Bu response'un içindeki data alanı DeviceResponse tipinde olacak yani belirlediğim JSON dönderecek.


# Cihaz listesini döndürür.
class DeviceListResponse(BaseModel):
    success: bool
    message: str
    data: list[DeviceResponse]


# Bir cihazın anlık durum bilgilerini döndürür.
class DeviceStatusResponse(BaseModel):
    device_id: int
    hostname: str
    status: DeviceStatus
    last_checked: datetime | None


# Cihaz durum bilgisini API response formatında döndürür.
class DeviceStatusAPIResponse(BaseModel):
    success: bool
    message: str
    data: DeviceStatusResponse