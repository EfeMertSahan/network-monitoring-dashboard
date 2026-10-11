#İki cihaz arasındaki gerçek network bağlantısını veritabanında tutacak.

from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)

from app.core.database import Base


class DeviceLink(Base): #Cihaz arasındaki gerçek network bağlantısını veritabanında tutacak
    __tablename__ = "device_links"

    __table_args__ = (
        UniqueConstraint(
            "source_device_id",
            "target_device_id",
            name="uq_device_link_pair",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
    )

    source_device_id = Column(
        Integer,
        ForeignKey(
            "devices.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    target_device_id = Column(
        Integer,
        ForeignKey(
            "devices.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    link_type = Column(
        String(50),
        nullable=False,
        default="ethernet",
    )

    status = Column(
        String(20),
        nullable=False,
        default="up",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )