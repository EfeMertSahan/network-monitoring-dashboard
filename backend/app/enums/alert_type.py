from enum import Enum


class AlertType(str, Enum):
    Offline = "Offline"
    HighLatency = "HighLatency"
    HighPacketLoss = "HighPacketLoss"
    HighCPU = "HighCPU"
    HighRAM = "HighRAM"
    HighDisk = "HighDisk"