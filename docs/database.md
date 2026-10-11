# Network Monitoring Dashboard — Database

## 1. Veritabanı Teknolojileri

Projenin veritabanı katmanında aşağıdaki teknolojiler kullanılmaktadır:

```text
Database      : PostgreSQL
ORM           : SQLAlchemy 2.x
Migration     : Alembic
Async Driver  : asyncpg
```

Genel veri erişim akışı:

```text
FastAPI
   ↓
Service
   ↓
Repository
   ↓
SQLAlchemy
   ↓
PostgreSQL
```

Migration yönetimi:

```text
SQLAlchemy Model
      ↓
Alembic Migration
      ↓
PostgreSQL Schema
```

---

## 2. Ana Tablolar

Mevcut ana tablolar:

```text
devices
device_credentials
metrics
alerts
device_links
```

Tabloların temel görevleri:

| Tablo | Görev |
|---|---|
| `devices` | İzlenen ağ cihazlarının temel bilgilerini tutar. |
| `device_credentials` | Cihaz bazlı SSH bağlantı bilgilerini tutar. |
| `metrics` | Zaman içerisinde toplanan cihaz metriklerini tutar. |
| `alerts` | Monitoring sırasında oluşan alarm kayıtlarını tutar. |
| `device_links` | Topolojideki cihazlar arasındaki bağlantıları tutar. |

---

## 3. `devices`

`devices` tablosu sistemde izlenen cihazların temel kimlik ve durum bilgilerini tutar.

Temel alanlar:

| Alan | Açıklama |
|---|---|
| `id` | Primary key. |
| `hostname` | Cihazın hostname bilgisi. |
| `ip_address` | Cihazın IP adresi. Benzersiz olarak tutulur. |
| `device_type` | Cihaz tipi. |
| `status` | Cihazın mevcut monitoring durumu. |
| `created_at` | Cihazın oluşturulma zamanı. |
| `last_checked` | Son monitoring kontrol zamanı. Nullable olabilir. |
| `is_active` | Cihazın scheduler tarafından izlenip izlenmeyeceğini belirler. |
| `location` | Cihazın konum bilgisi. |

Cihaz durumu:

```text
Pending
Online
Offline
```

`ip_address` alanının unique olması aynı IP adresinin birden fazla cihaz için kullanılmasını engeller.

---

## 4. `device_credentials`

`device_credentials` tablosu cihazlara özel SSH bağlantı bilgilerini tutar.

Alanlar:

| Alan | Açıklama |
|---|---|
| `id` | Primary key. |
| `device_id` | `devices.id` alanına foreign key. |
| `enabled` | SSH credential kaydının aktif olup olmadığını belirtir. |
| `port` | SSH portu. Varsayılan değer `22`. |
| `username` | SSH kullanıcı adı. |
| `password_encrypted` | Şifrelenmiş SSH password değeri. |
| `created_at` | Credential oluşturulma zamanı. |
| `updated_at` | Son güncelleme zamanı. |

İlişki:

```text
devices 1 ───────── 0..1 device_credentials
```

`device_id` unique olduğu için bir cihaz için birden fazla credential kaydı yerine tek aktif bağlantı bilgisi yapısı kullanılmaktadır.

### Password saklama

Password plaintext olarak tutulmaz.

```text
SSH Password
     ↓
encrypt_secret()
     ↓
Fernet encrypted value
     ↓
password_encrypted
     ↓
PostgreSQL
```

Monitoring sırasında:

```text
password_encrypted
       ↓
decrypt_secret()
       ↓
SSH connection
```

API response modelinde password alanı bulunmamaktadır.

Encryption key:

```text
CREDENTIAL_ENCRYPTION_KEY
```

environment değişkeni üzerinden sağlanır.

---

## 5. `metrics`

`metrics` tablosu monitoring sonucunda toplanan tarihsel ölçümleri saklar.

Alanlar:

| Alan | Açıklama |
|---|---|
| `id` | Primary key. |
| `device_id` | Ölçümün ait olduğu cihaz. |
| `cpu_usage` | CPU kullanım yüzdesi. Nullable olabilir. |
| `ram_usage` | RAM kullanım yüzdesi. Nullable olabilir. |
| `disk_total_gb` | Toplam disk kapasitesi. Nullable olabilir. |
| `disk_used_gb` | Kullanılan disk kapasitesi. Nullable olabilir. |
| `latency_ms` | Ping gecikmesi. |
| `packet_loss` | Paket kaybı yüzdesi. |
| `uptime_seconds` | Cihaz uptime bilgisi. Nullable olabilir. |
| `timestamp` | Ölçümün oluşturulduğu zaman. |

İlişki:

```text
devices 1 ───────── N metrics
```

Örnek kayıt mantığı:

```text
device_id = 3
cpu_usage = 0
ram_usage = 5
disk_total_gb = 1007
disk_used_gb = 24
latency_ms = 0.501
packet_loss = 0
uptime_seconds = 459
timestamp = ...
```

### Null metric değerleri

Bir cihaz ping üzerinden erişilebilir olsa bile SSH sistem metrikleri alınamazsa:

```text
cpu_usage         = NULL
ram_usage         = NULL
disk_total_gb     = NULL
disk_used_gb      = NULL
uptime_seconds    = NULL
```

ancak ping metrikleri yine kaydedilebilir:

```text
latency_ms
packet_loss
```

Bu ayrım, ağ erişilebilirliği ile SSH üzerinden sistem metriklerinin alınabilmesini birbirinden ayırır.

---

## 6. `alerts`

`alerts` tablosu monitoring sırasında tespit edilen problemleri saklar.

Alarm türleri uygulamadaki `AlertType` enum'u ile yönetilir.

Mevcut monitoring senaryolarında kullanılan alarm türleri:

```text
Offline
HighLatency
HighPacketLoss
HighCPU
HighRAM
HighDisk
```

Alarm seviyeleri `AlertLevel` enum'u üzerinden yönetilir.

Alarm yaşam döngüsü:

```text
Open
  ↓
Problem devam ediyor
  ↓
Resolved
```

Alarm kayıtlarında temel olarak cihaz, alarm türü, seviye, mesaj ve çözülme durumunu temsil eden bilgiler bulunur.

Monitoring sırasında aynı problem için sürekli yeni kayıt oluşturulmasını önlemek amacıyla açık alarm kontrolü uygulanır.

Örnek:

```text
CPU > threshold
      ↓
HighCPU alarmı oluştur
      ↓
CPU > threshold
      ↓
Mevcut açık alarm kullanılmaya devam eder
      ↓
CPU <= threshold
      ↓
HighCPU alarmı resolve edilir
```

Offline alarmı için de aynı lifecycle mantığı geçerlidir.

---

## 7. `device_links`

`device_links` tablosu ağ topolojisindeki cihaz bağlantılarını tutar.

Alanlar:

| Alan | Açıklama |
|---|---|
| `id` | Primary key. |
| `source_device_id` | Kaynak cihazın foreign key'i. |
| `target_device_id` | Hedef cihazın foreign key'i. |
| `link_type` | Bağlantı tipi. |
| `status` | Bağlantı durumu. |
| `created_at` | Bağlantı oluşturulma zamanı. |
| `updated_at` | Son güncelleme zamanı. |

Foreign key'ler:

```text
source_device_id → devices.id
target_device_id → devices.id
```

Foreign key'ler `ON DELETE CASCADE` ile tanımlanmıştır.

Bağlantı tipleri:

```text
ethernet
fiber
wireless
vpn
other
```

Bağlantı durumları:

```text
up
down
unknown
```

### Topoloji kısıtları

Aynı cihazın kendisine link oluşturulması service katmanında engellenir:

```text
device A → device A
```

Aynı cihaz çifti için duplicate bağlantı oluşturulması da engellenir.

Ayrıca ters yönlü tekrar:

```text
A → B
B → A
```

aynı bağlantı çifti olarak değerlendirilir ve service katmanında engellenir.

Database seviyesinde de aşağıdaki unique constraint bulunmaktadır:

```text
uq_device_link_pair
```

Bu constraint:

```text
source_device_id
target_device_id
```

ikilisinin tekrar etmesini engeller.

---

## 8. Tablo İlişkileri

Ana ilişkiler:

```text
                    ┌─────────────────────┐
                    │       devices       │
                    │      PK: id         │
                    └─────────┬───────────┘
                              │
          ┌───────────────────┼────────────────────┐
          │                   │                    │
          │                   │                    │
          ▼                   ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│device_credentials│  │     metrics     │  │      alerts     │
│     FK device_id │  │   FK device_id  │  │   FK device_id  │
└─────────────────┘  └─────────────────┘  └─────────────────┘

                    devices self-reference
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
          source_device_id      target_device_id
                    └─────────┬─────────┘
                              ▼
                    ┌─────────────────┐
                    │   device_links  │
                    └─────────────────┘
```

Özet:

```text
Device
 ├── DeviceCredential
 ├── Metrics
 ├── Alerts
 └── DeviceLinks
```

`device_links` tablosu aynı `devices` tablosuna iki farklı foreign key ile bağlanarak self-referencing topology ilişkisi oluşturur.

---

## 9. Primary Key ve Foreign Key Yapısı

### Primary Key

Her ana tabloda benzersiz kimlik için `id` primary key kullanılır.

```text
devices.id
device_credentials.id
metrics.id
alerts.id
device_links.id
```

### Foreign Key

Cihaza bağlı kayıtlar `device_id` üzerinden ilişkilendirilir:

```text
device_credentials.device_id → devices.id
metrics.device_id            → devices.id
alerts.device_id             → devices.id
```

Topoloji bağlantıları ise:

```text
device_links.source_device_id → devices.id
device_links.target_device_id → devices.id
```

---

## 10. Timestamp Yapısı

Tablolarda oluşturulma/güncellenme zamanları tutulmaktadır.

Kullanılan alanlara örnek:

```text
created_at
updated_at
last_checked
timestamp
resolved_at
```

Uygulamadaki zaman değerleri UTC yaklaşımıyla yönetilir.

Monitoring kaydında:

```text
last_checked
```

cihazın son kontrol zamanını,

```text
metrics.timestamp
```

ölçüm zamanını,

```text
alerts.resolved_at
```

varsa alarmın çözülme zamanını temsil eder.

---

## 11. Index ve Constraint Yapısı

Projede performans ve veri bütünlüğü için constraint/index yapısı kullanılmaktadır.

Bilinen önemli constraint'ler:

```text
devices.ip_address          UNIQUE
device_credentials.device_id UNIQUE
device_links(source_device_id, target_device_id) UNIQUE
```

Metrics sorgularında cihaz ve zaman bilgisi birlikte kullanıldığı için aşağıdaki index migration ile eklenmiştir:

```text
metrics(device_id, timestamp)
```

Bu yapı özellikle:

```text
Belirli cihaz
    +
Belirli zaman aralığı
```

sorgularını desteklemek için kullanılır.

Örneğin:

```text
device_id = 3
timestamp >= son_24_saat
```

gibi sorgular metrics ekranları için önemlidir.

---

## 12. Alembic Migration Zinciri

Veritabanı şeması Alembic ile versiyonlanmaktadır.

Mevcut migration zinciri:

```text
35f63a8793d9
    ↓
47ff5e1c867a
    ↓
8c404749ea06
    ↓
d8a133e12781
    ↓
e2a3cda784d0
    ↓
093c6928c2f7
```

Migration'ların ana konuları:

```text
35f63a8793d9 → Alert type değişikliği
47ff5e1c867a → Device ve Metrics tabloları
8c404749ea06 → Alerts tablosu
d8a133e12781 → Device credentials tablosu
e2a3cda784d0 → Metrics device/timestamp index'i
093c6928c2f7 → Device links tablosu
```

Mevcut durumda:

```text
093c6928c2f7 (head)
```

tek migration head'dir.

---

## 13. Migration Çalışma Mantığı

Yeni bir model değişikliği yapıldığında normal akış:

```text
SQLAlchemy Model değişir
        ↓
alembic revision --autogenerate
        ↓
Migration dosyası
        ↓
Kontrol / review
        ↓
alembic upgrade head
        ↓
PostgreSQL
```

Migration dosyaları source control altında tutulur.

Veritabanı şemasının doğrudan elle değiştirilmesi yerine Alembic migration kullanılması hedeflenmiştir.

---

## 14. Veri Akışları

### Monitoring sonucunun database'e kaydedilmesi

```text
Ping / SSH
     ↓
MonitoringService
     ↓
System metrics parse
     ↓
Alert kontrolü
     ↓
Device update
     ↓
Metrics create
     ↓
MetricsRepository
     ↓
PostgreSQL
```

### Topoloji bağlantısı

```text
POST /api/v1/topology/links
          ↓
DeviceLinkService
          ↓
DeviceLinkRepository
          ↓
device_links
          ↓
GET /api/v1/topology/links
          ↓
Frontend Topology
```

---

## 15. Veri Bütünlüğü

Sistemde temel veri bütünlüğü kuralları uygulanmaktadır.

Örnekler:

```text
Duplicate IP
    ↓
UNIQUE constraint / validation
    ↓
409 Conflict
```

Topoloji:

```text
Unknown device
    ↓
LookupError
    ↓
404 Not Found
```

Topoloji duplicate link:

```text
A → B
ve tekrar
A → B
    ↓
Conflict
    ↓
409
```

Kendi kendine link:

```text
A → A
    ↓
Validation
    ↓
ValueError / 409
```

Credential password:

```text
Plain password
    ↓
encrypt
    ↓
DB
```

Response:

```text
DeviceCredentialResponse
    ↓
password yok
```

---

## 16. Database Katmanının Genel Özeti

Veritabanının temel sorumlulukları:

```text
Device identity
Device status
SSH credentials
Historical metrics
Alert history
Network topology
```

İlişkisel yapı:

```text
                 Device
                  │
        ┌─────────┼─────────┬─────────┐
        │         │         │         │
        ▼         ▼         ▼         ▼
   Credential   Metrics   Alerts    Links
```

Bu yapı sayesinde aynı cihazın:

- kimliği,
- erişilebilirlik durumu,
- SSH bağlantı bilgileri,
- tarihsel performans ölçümleri,
- alarm geçmişi,
- topoloji bağlantıları

birbirinden ayrılmış tablolar üzerinden yönetilmektedir.
