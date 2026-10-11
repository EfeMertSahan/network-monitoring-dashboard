#bu dosya(__init__.py): bütün modellerin merkezi import noktası
# Tüm SQLAlchemy modellerini yükleyerek model ilişkilerinin doğru kurulmasını sağlar.

from app.models.device import Device
from app.models.device_credential import DeviceCredential
from app.models.metrics import Metrics
from app.models.alert import Alert
from app.models.device_link import DeviceLink

__all__ = [
    "Device",
    "DeviceCredential",
    "Metrics",
    "Alert",
]