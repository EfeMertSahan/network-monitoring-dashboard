# create_async_engine: PostgreSQL gibi bir veritabanıyla async şekilde iletişim kurabilecek bir AsyncEngine oluşturmak.
#asyncpg: PostgreSQL ile Python arasında async iletişim sağlayan PostgreSQL driver'ıdır
#AsyncSession: Async SQLAlchemy ORM işlemlerini yönetecek Session sınıfı.
#async_sessionmaker: Session üreticisi.

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base

from app.core.config import settings

#declarative_base: SQLAlchemy'nin ORM modelleri için kullanılacak temel sınıfı oluşturuyor.
Base = declarative_base()

#Engine:Database iletişim altyapısını sağlar.
engine = create_async_engine(
    settings.database_url
)


async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False  #commit sonrasında nesnenin attribute'larının otomatik olarak expire(sona ermesini) edilmesini istemiyoruz.
)


async def get_db():
    async with async_session_factory() as session:
        yield session   #yield:fonksiyonun yaşam döngüsünü tamamen bitirme.