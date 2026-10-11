from enum import Enum

#kullanıcılar cihaz türü girerken panelde böyle gözüksün farklı isimlendirmeler olmasın
class DeviceType(str, Enum):
    Switch = "Switch"
    Router = "Router"
    Server = "Server"
    Firewall = "Firewall"
    AccessPoint = "Access Point"
    Printer = "Printer"