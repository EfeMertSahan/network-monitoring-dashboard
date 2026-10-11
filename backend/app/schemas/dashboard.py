from pydantic import BaseModel


# Dashboard üzerinde gösterilecek özet bilgileri temsil eder.
class DashboardData(BaseModel):
    total_devices: int
    online_devices: int
    offline_devices: int
    pending_devices: int

    open_alerts: int
    critical_alerts: int
    warning_alerts: int
    info_alerts: int


# Dashboard API'sinin standart response yapısını temsil eder.
class DashboardResponse(BaseModel):
    success: bool
    message: str
    data: DashboardData