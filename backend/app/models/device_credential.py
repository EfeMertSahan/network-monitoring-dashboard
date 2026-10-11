#Her cihazın SSH bağlantı bilgilerini veritabanında tutuyor.

from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class DeviceCredential(Base):
    __tablename__ = "device_credentials"

    id = Column(
        Integer,
        primary_key=True,
    )

    device_id = Column(
        Integer,
        ForeignKey("devices.id"),
        unique=True,
        nullable=False,
    )

    enabled = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    port = Column(
        Integer,
        nullable=False,
        default=22,
    )

    username = Column(
        String(100),
        nullable=False,
    )

    password_encrypted = Column(
        String(2000),
        nullable=False,
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

    device = relationship(
        "Device",
        back_populates="ssh_credential",
    )