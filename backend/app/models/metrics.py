from datetime import datetime

from sqlalchemy import (
    Column, #Sütun Oluşturur.
    DateTime, #Tarih ve Zaman kütüphanesi.
    Float, #Gecikme,Paket kaybını float olacak.
    ForeignKey, #Device İd referansı
    Integer, #CPU,RAM,Disk ve Çalışma süresi kullanımını integer olacak
    Index, #Belirli sütunlarda veri arama ve sorgulama işlemlerini hızlandırır.
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Metrics(Base):
    __tablename__ = "metrics"

    id = Column(
        Integer,
        primary_key=True
    )

    device_id = Column(
        Integer,
        ForeignKey("devices.id"),
        nullable=False
    )

    cpu_usage = Column(
        Integer,
        nullable=True
    )

    ram_usage = Column(
        Integer,
        nullable=True
    )

    disk_total_gb = Column(
        Integer,
        nullable=True
    )

    disk_used_gb = Column(
        Integer,
        nullable=True
    )

    latency_ms = Column(
        Float, #Gecikmeyi float olarak tutacak.
        nullable=True
    )

    packet_loss = Column(
        Float, #Paket kaybını float olarak tutacak.
        nullable=True
    )

    #Çalışma süresini saniye olarak tutacak.
    uptime_seconds = Column(
        Integer,
        nullable=True
    )

    #Bu alan ölçüm zamanını(Tarih ve Zaman) tutacak.
    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    #Metrik Tablosu device ile iliskişki kuracak.
    device = relationship(
        "Device",
        back_populates="metrics"
    )

Index(
    "ix_metrics_device_id_timestamp",
    Metrics.device_id,
    Metrics.timestamp,
)