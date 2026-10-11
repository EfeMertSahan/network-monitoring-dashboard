#Bu dosyanın görevi alarm seviyelerini tek bir standart altında toplamak.
#Info      → Bilgilendirme
#Warning   → Uyarı
#Critical  → Kritik durum


from enum import Enum


class AlertLevel(str, Enum):
    Info = "Info"
    Warning = "Warning"
    Critical = "Critical"