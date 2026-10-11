from enum import Enum

#cihaz durumu bu stringlerden biri olmalı
class DeviceStatus(str, Enum):
    Pending = "Pending"
    Online = "Online"
    Offline = "Offline"