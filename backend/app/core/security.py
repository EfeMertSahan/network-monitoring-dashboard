from cryptography.fernet import Fernet

from app.core.config import settings


def get_fernet() -> Fernet:
    # Environment içerisindeki Fernet anahtarının mevcut olup olmadığını kontrol eder.
    if not settings.credential_encryption_key:
        raise RuntimeError(
            "CREDENTIAL_ENCRYPTION_KEY tanımlanmamış. "
            "Şifreleme anahtarını .env dosyasında tanımlayın."
        )

    # String olarak gelen anahtarı bytes formatına çevirerek Fernet nesnesi oluşturur.
    return Fernet(
        settings.credential_encryption_key.encode()
    )


def encrypt_secret(
    secret: str,
) -> str:
    # Fernet encryption nesnesini oluşturur.
    fernet = get_fernet()

    # Plain-text şifreyi bytes formatına çevirir, ardından şifreler.
    encrypted = fernet.encrypt(
        secret.encode()
    )

    # Veritabanında String olarak saklanabilmesi için tekrar string'e çevirir.
    return encrypted.decode()


def decrypt_secret(
    encrypted_secret: str,
) -> str:
    # Fernet encryption nesnesini oluşturur.
    fernet = get_fernet()

    # Veritabanından gelen şifrelenmiş değeri çözer.
    decrypted = fernet.decrypt(
        encrypted_secret.encode()
    )

    # Çözülmüş bytes değerini normal string'e çevirir.
    return decrypted.decode()