from datetime import datetime

#Bu bizim kuracağımız ORM kütüphanesi
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.enums.device_status import DeviceStatus
from app.enums.device_type import DeviceType


class Device(Base):
    __tablename__ = "devices"

    # Primary Key
    id = Column(
        Integer,
        primary_key=True
    )

    # Device Information
    hostname = Column(
        String(50),
        nullable=False
    )

    ip_address = Column(
        String(45),
        unique=True,
        nullable=False
    )

    device_type = Column(
        Enum(DeviceType),
        nullable=False
    )

    # System Information
    # Durum Tablosu
    status = Column(
        Enum(DeviceStatus),
        nullable=False,
        default=DeviceStatus.Pending
    )

    # Oluşrurulma Tarihi
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Son Ping Kontrolu
    last_checked = Column(
        DateTime,
        nullable=True
    )

    # Soft Delete Yani cihaz silinse bile eski veri kayıtları tutulur.
    is_active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    # Optional Information
    # Yer Bilgisi hangi cihaz hangi fakültede, nerede
    location = Column(
        String(50),
        nullable=True
    )

    #Metrik Tablosu device ile iliskişki kuracak.
    metrics = relationship(
        "Metrics",
        back_populates="device"
    )

    ##Alert → Device ilişkisini oluşturuyor.
    alerts = relationship(
        "Alert",
        back_populates="device"
    )

    # Device ile SSH kimlik bilgileri arasında birebir ilişki kurar.
    ssh_credential = relationship(
        "DeviceCredential",
        back_populates="device",
        uselist=False,
        cascade="all, delete-orphan",
    )