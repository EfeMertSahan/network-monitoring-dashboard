#Bu alarmın database'de hangi alanlara sahip olduğunu tanımlıyoruz

from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.enums.alert_level import AlertLevel
from app.enums.alert_type import AlertType


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(  #Alarmın benzersiz ID'si
        Integer,
        primary_key=True,
    )

    device_id = Column(  #Alarmın hangi cihaza ait olduğu
        Integer,
        ForeignKey("devices.id"),
        nullable=False,
    )

    alert_type = Column( #Alarmin türünü tutuyor. Alarmın hangi olay nedeniyle oluştuğudur
        Enum(AlertType),
        nullable=False,
    )

    level = Column(  #Alarm seviyesini tutuyor.
        Enum(AlertLevel),
        nullable=False,
    )

    message = Column(  #Alarmın açıklamasını tutuyoruz.
        String(255),
        nullable=False,
    )

    is_resolved = Column(  #Alarm çözüldü mü?
        Boolean,
        nullable=False,
        default=False,
    )

    created_at = Column(  #Alarmın oluşma zamanını tutuyor.
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    resolved_at = Column(  #Alarm ne zaman çözüldü?
        DateTime,
        nullable=True,
    )

    device = relationship(  #Alert → Device ilişkisini oluşturuyor.
        "Device",
        back_populates="alerts",
    )