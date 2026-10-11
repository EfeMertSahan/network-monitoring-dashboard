#Bu dosya Alert bilgilerinin API'ye nasıl girip API'den nasıl çıkacağını belirleyecek.

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.enums.alert_level import AlertLevel
from app.enums.alert_type import AlertType


#API'ye yeni alarm oluşturmak için gönderilecek veriyi tanımlıyor.
class AlertCreate(BaseModel):
    device_id: int
    alert_type: AlertType
    level: AlertLevel
    message: str


# Server → Client tarafına gönderilecek alarm bilgisini temsil eder.
class AlertResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    device_id: int
    alert_type: AlertType
    level: AlertLevel
    message: str
    is_resolved: bool
    created_at: datetime
    resolved_at: datetime | None


# Birden fazla alarmın API response formatını temsil eder.
class AlertListResponse(BaseModel):
    success: bool
    message: str
    data: list[AlertResponse]


# Tek bir alarm için API response formatını temsil eder.
class AlertAPIResponse(BaseModel):
    success: bool
    message: str
    data: AlertResponse


# Sayfalama ve filtreleme sonucunda dönen alarm listesini temsil eder.
class AlertPaginatedResponse(BaseModel):
    success: bool
    message: str
    data: list[AlertResponse]
    page: int
    limit: int
    total: int
    total_pages: int