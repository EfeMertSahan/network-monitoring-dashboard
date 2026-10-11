#Monitoring API response/request modelleri
#Scan endpoint'inin dışarıya vereceği response yapısı.
from pydantic import BaseModel

from app.schemas.device import DeviceResponse
from app.schemas.metrics import MetricsResponse


class ScanData(BaseModel):
    device: DeviceResponse
    metrics: MetricsResponse


class ScanResponse(BaseModel):
    success: bool
    message: str
    data: ScanData