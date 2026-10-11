#Bir IP adresine SSH ile bağlanmak ve uzaktaki komutun çıktısını güvenli şekilde almak.

from dataclasses import dataclass
from time import sleep

import paramiko

from app.utils.logger import logger


@dataclass
class SSHResult:
    success: bool
    output: str | None
    error: str | None


def execute_commands(
    ip_address: str, #cihazın IP adresi
    username: str, #SSH kullanıcı adı
    password: str, #SSH şifresi
    commands: list[str], #Linux'ta çalıştırılacak komut
    port: int = 22, #SSH portu
    timeout: int = 5, #bağlantı/işlem için bekleme süresi
    retries: int = 3, #bağlantı hatası durumunda yeniden bağlanma sayısı
) -> dict[str, str]:
    last_error = None

    for attempt in range(
        1,
        retries + 1,
    ):
        client = paramiko.SSHClient() #SSH bağlantısı

        client.set_missing_host_key_policy( #bağlantı hatası durumunda otomatik oluşturma
            paramiko.AutoAddPolicy()
        )

        try:
            # Her yeniden bağlanma denemesinde yeni SSH bağlantısı oluşturulur.
            client.connect(
                hostname=ip_address,
                port=port,
                username=username,
                password=password,
                timeout=timeout,
                look_for_keys=False,
                allow_agent=False,
                banner_timeout=timeout,
                auth_timeout=timeout,
            )

            results = {}

            for command in commands:
                _, stdout, stderr = client.exec_command(
                    command,
                    timeout=timeout,
                )

                output = stdout.read().decode(
                    "utf-8",
                    errors="replace",
                ).strip()

                error = stderr.read().decode(
                    "utf-8",
                    errors="replace",
                ).strip()

                if error:
                    raise RuntimeError(
                        f"Komut başarısız: "
                        f"{command} - {error}"
                    )

                results[command] = output

            return results

        except Exception as exc:
            last_error = str(exc)

            logger.warning(
                f"SSH bağlantı denemesi başarısız. "
                f"IP: {ip_address}, "
                f"Port: {port}, "
                f"Deneme: {attempt}/{retries}, "
                f"Hata: {last_error}"
            )

            if attempt < retries: # Her başarısız denemeden sonra biraz daha fazla bekler.
                sleep(attempt)

        finally: # Her denemenin kendi SSH client bağlantısı kapatılır.
            client.close()

    raise RuntimeError(
        last_error
        or "SSH bağlantısı başarısız."
    )