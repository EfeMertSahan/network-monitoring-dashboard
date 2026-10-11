#Uygulamanın merkezi yapılandırma dosyasıdır.

from pathlib import Path
#pydantic_settings : Uygulama ayarlarını yönetmek için kullanılan paket.
#BaseSettings:Ortam değişkenleri ve .env gibi kaynaklardan gelen ayarları bir Python sınıfına dönüştürmemizi sağlar.
#SettingsConfigDict: Ayar modelimizin nasıl davranacağını belirtmek için kullanılacak.

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",  #Proje kökündeki .env dosyasını ayar kaynağı olarak kullan.
        env_file_encoding="utf-8"
    )

    database_url: str #Settings nesnesinin database_url adında string bir ayarı olacak.

#.env içinde değer verilmezse alttaki degerler kullanılacak.
    ping_count: int = 2  #ping sayısı
    ping_timeout: int = 2 #Her ping için en fazla 2 saniye beklenir.
    monitoring_interval_seconds: int = 30 #Cihazlar her 30 saniyede bir kontrol edilir.
    max_concurrent_devices: int = 20 #Maksimum aynı anda kontrol edilecek cihaz sayısı

    high_latency_threshold_ms: float = 100.0  #Gecikme değeri 100 ms'den fazla ise uyarı verilir.
    high_packet_loss_threshold_percent: float = 20.0 #Paket kaybı oranı 20% den fazla ise uyarı verilir.

    high_cpu_threshold_percent: float = 80.0 #CPU kullanım oranı 80% den fazla ise HighCPU alarmı oluştur.
    high_ram_threshold_percent: float = 80.0 #RAM kullanım oranı 80% den fazla ise HighRAM alarmı oluştur.
    high_disk_threshold_percent: float = 80.0 #Disk kullanım oranı 80% den fazla ise HighDisk alarmı oluştur.

    credential_encryption_key: str | None = None #Kullanıcı bilgilerinin sifrelenmesi icin kullanılacak anahtar

    ssh_retries: int = 3 #SSH baglantısı basarısız olursa 3 defa yeniden denenir
    ssh_timeout: int = 5 #SSH baglantısı basarısız olursa 5 saniye beklenir



settings = Settings()