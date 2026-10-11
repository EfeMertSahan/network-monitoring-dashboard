# Network Monitoring Dashboard — API

## 1. API Genel Bilgileri

Backend REST API, FastAPI ile geliştirilmiştir.

Temel yapı:

```text
FastAPI
  ↓
API Router
  ↓
Service
  ↓
Repository
  ↓
SQLAlchemy
  ↓
PostgreSQL
```

API ana prefix'i:

```text
/api/v1
```

Uygulamanın FastAPI Swagger arayüzü:

```text
http://127.0.0.1:8000/docs
```

OpenAPI şeması:

```text
http://127.0.0.1:8000/openapi.json
```

> Swagger/OpenAPI, çalışan uygulamadaki endpoint imzalarının nihai kaynağıdır. Bu dokümanda proje içinde doğrulanmış route grupları ve kullanılan veri sözleşmeleri özetlenmektedir.

---

## 2. Endpoint Grupları

| Grup | Prefix | Amaç |
|---|---|---|
| Devices | `/api/v1/devices` | Cihaz yönetimi |
| Monitoring | `/api/v1` | Monitoring işlemleri |
| Alerts | `/api/v1/alerts` | Alarm yönetimi |
| Dashboard | `/api/v1/dashboard` | Dashboard özet verileri |
| Topology | `/api/v1/topology` | Ağ topolojisi bağlantıları |

---

# 3. Devices API

Prefix:

```text
/api/v1/devices
```

Cihaz CRUD işlemlerinin tamamı bu grup üzerinden yürütülür.

## 3.1 Cihazları Listeleme

```http
GET /api/v1/devices
```

Amaç:

```text
Sistemde kayıtlı cihazları getirir.
```

Response yapısı:

```json
{
  "success": true,
  "message": "Cihazlar başarıyla getirildi.",
  "data": [
    {
      "id": 3,
      "hostname": "test-device",
      "ip_address": "127.0.0.1",
      "device_type": "Server",
      "status": "Online",
      "location": "Test",
      "created_at": "2026-09-09T18:52:23.345217",
      "last_checked": "2026-09-18T21:52:19.068037"
    }
  ]
}
```

---

## 3.2 Cihaz Oluşturma

```http
POST /api/v1/devices
```

Amaç:

```text
Yeni bir monitoring cihazı oluşturur.
```

Cihaz oluşturulurken IP adresinin benzersiz olması gerekir.

Aynı IP adresi için yapılan yeni kayıt denemesi conflict ile sonuçlanır.

Örnek request:

```json
{
  "hostname": "server-01",
  "ip_address": "192.168.1.20",
  "device_type": "Server",
  "location": "Merkez"
}
```

> Request alanlarının kesin tipi ve izin verilen `device_type` değerleri çalışan OpenAPI şemasından kontrol edilmelidir.

---

## 3.3 Cihaz Getirme

```http
GET /api/v1/devices/{device_id}
```

Amaç:

```text
Tek bir cihazın ayrıntılarını getirir.
```

Örnek:

```http
GET /api/v1/devices/3
```

---

## 3.4 Cihaz Güncelleme

```http
PUT /api/v1/devices/{device_id}
```

Amaç:

```text
Mevcut cihaz bilgilerini günceller.
```

Özellikle cihaz IP'si güncellenirken de benzersizlik kontrolü uygulanır.

---

## 3.5 Cihaz Silme

```http
DELETE /api/v1/devices/{device_id}
```

Amaç:

```text
Belirtilen cihaz kaydını siler.
```

Cihaza bağlı verilerin foreign key ve cascade davranışları database modeline göre uygulanır.

---

# 4. SSH Credential API

SSH credential işlemleri cihaz bazlıdır.

Prefix:

```text
/api/v1/devices/{device_id}/ssh-credentials
```

## 4.1 Credential Oluşturma / Güncelleme

```http
PUT /api/v1/devices/{device_id}/ssh-credentials
```

Amaç:

```text
Cihaza ait SSH bağlantı bilgilerini oluşturur veya günceller.
```

Örnek request:

```json
{
  "enabled": true,
  "port": 2222,
  "username": "monitor",
  "password": "monitor123"
}
```

Response içerisinde password döndürülmez.

Örnek response:

```json
{
  "id": 1,
  "device_id": 3,
  "enabled": true,
  "port": 2222,
  "username": "monitor",
  "created_at": "2026-09-18T20:00:00",
  "updated_at": "2026-09-18T20:00:00"
}
```

---

## 4.2 Credential Getirme

```http
GET /api/v1/devices/{device_id}/ssh-credentials
```

Amaç:

```text
Cihaza ait SSH credential bilgisini getirir.
```

Password response modelinde bulunmaz.

---

## 4.3 Credential Silme

```http
DELETE /api/v1/devices/{device_id}/ssh-credentials
```

Amaç:

```text
Cihazın SSH credential kaydını siler.
```

---

# 5. Monitoring API

Monitoring işlemleri backend'deki `MonitoringService` tarafından yürütülür.

Temel monitoring akışı:

```text
Device
  ↓
Ping
  ↓
Online / Offline
  ↓
Online ise SSH
  ↓
CPU / RAM / Disk / Uptime
  ↓
Alert kontrolü
  ↓
Metrics kaydı
```

Monitoring API'sinin çalışan route'ları uygulamanın OpenAPI/Swagger çıktısında görüntülenebilir:

```text
http://127.0.0.1:8000/docs
```

Bu bölümde monitoring işleminin iş mantığı aşağıdaki şekilde özetlenmektedir:

```text
Ping
 ├── latency_ms
 ├── packet_loss
 └── is_alive

SSH
 ├── CPU
 ├── RAM
 ├── Disk
 └── Uptime
```

Ping sonucu başarısızsa cihaz `Offline` olarak işaretlenir ve ilgili offline alarm lifecycle'ı çalıştırılır.

Ping başarılıysa cihaz `Online` olarak işaretlenir.

SSH sistem metrikleri alınamazsa ağ erişilebilirliği ile sistem metriklerinin alınamaması birbirinden ayrılır.

---

# 6. Metrics API

Metrics endpoint'leri cihazların tarihsel monitoring verilerini API üzerinden frontend'e sunar.

Metrics response'larında aşağıdaki temel alanlar kullanılır:

```json
{
  "id": 1581,
  "device_id": 3,
  "cpu_usage": 0,
  "ram_usage": 6,
  "disk_total_gb": 1007,
  "disk_used_gb": 24,
  "latency_ms": 0.585,
  "packet_loss": 0,
  "uptime_seconds": 339,
  "timestamp": "2026-09-18T21:35:09.974137"
}
```

Pagination response'larında:

```text
data
page
limit
total
total_pages
```

alanları kullanılır.

Örnek:

```json
{
  "data": [],
  "page": 1,
  "limit": 20,
  "total": 102,
  "total_pages": 6
}
```

Frontend bu verileri:

```text
Metrics Explorer / Metrik Analizi
Device Detail
Dashboard
```

ekranlarında kullanmaktadır.

---

# 7. Alerts API

Prefix:

```text
/api/v1/alerts
```

Alarm API'sinin temel görevleri:

```text
Alarm listeleme
Alarm filtreleme
Alarm durumunu inceleme
Alarm resolve işlemi
```

Monitoring sırasında oluşturulabilen temel alarm türleri:

```text
Offline
HighLatency
HighPacketLoss
HighCPU
HighRAM
HighDisk
```

Alarm seviyeleri:

```text
Critical
Warning
Info
```

Frontend:

```text
Alarm Merkezi
```

ekranında alarm verilerini kullanır.

Açık alarm filtreleme mantığı:

```text
is_resolved = false
```

çözülmüş alarm:

```text
is_resolved = true
```

Bir alarm çözülürken çözülme zamanı `resolved_at` alanında tutulur.

---

# 8. Dashboard API

Prefix:

```text
/api/v1/dashboard
```

Dashboard API'sinin amacı, frontend dashboard ekranının ihtiyaç duyduğu toplulaştırılmış monitoring verilerini sağlamaktır.

Dashboard tarafında kullanılan başlıca veri grupları:

```text
Device status summary
Metric summary
Alert summary
Device health
```

Frontend bu verileri:

```text
Ağ İzleme Kontrol Paneli
```

ekranındaki kart, tablo ve grafiklerde kullanmaktadır.

---

# 9. Topology API

Prefix:

```text
/api/v1/topology
```

Topoloji API'si `device_links` tablosundaki bağlantıları yönetir.

## 9.1 Bağlantıları Listeleme

```http
GET /api/v1/topology/links
```

Başarılı response:

```json
{
  "success": true,
  "message": "Topology bağlantıları başarıyla getirildi.",
  "data": [
    {
      "id": 1,
      "source_device_id": 1,
      "target_device_id": 3,
      "link_type": "ethernet",
      "status": "up",
      "created_at": "2026-09-18T20:00:00",
      "updated_at": "2026-09-18T20:00:00"
    }
  ]
}
```

Bu endpoint frontend'deki `useTopology()` hook'u tarafından kullanılır.

---

## 9.2 Bağlantı Oluşturma

```http
POST /api/v1/topology/links
```

Örnek request:

```json
{
  "source_device_id": 1,
  "target_device_id": 3,
  "link_type": "ethernet",
  "status": "up"
}
```

Bağlantı tipleri:

```text
ethernet
fiber
wireless
vpn
other
```

Durumlar:

```text
up
down
unknown
```

Business validation:

```text
source == target
        ↓
       hata

A → B mevcut
        ↓
A → B tekrar
       hata

A → B mevcut
        ↓
B → A
       hata
```

Cihazlardan biri bulunamazsa:

```text
404
```

Bağlantı conflict durumunda:

```text
409
```

kullanılır.

---

## 9.3 Bağlantı Silme

```http
DELETE /api/v1/topology/links/{link_id}
```

Amaç:

```text
Belirtilen topology bağlantısını siler.
```

---

# 10. HTTP Status Kodları

Projede temel olarak aşağıdaki HTTP durumları kullanılmaktadır:

| Status | Anlam |
|---|---|
| `200 OK` | Başarılı GET/update işlemi |
| `201 Created` | Yeni kaynak oluşturuldu |
| `204 No Content` | Başarılı, response body yok |
| `404 Not Found` | Kaynak bulunamadı |
| `409 Conflict` | Unique/conflict durumu |
| `422 Unprocessable Entity` | Validation hatası |
| `500 Internal Server Error` | Beklenmeyen sunucu hatası |

---

# 11. Validation

API request'leri Pydantic schema'ları üzerinden doğrulanır.

Örnek credential validation:

```text
port
1 ≤ port ≤ 65535
```

```text
username
1 ≤ uzunluk ≤ 100
```

Topology validation:

```text
source_device_id >= 1
target_device_id >= 1
```

Credential password:

```text
SecretStr
```

kullanılarak API veri modelinde secret olarak ele alınır.

---

# 12. Error Response Yaklaşımı

API katmanında validation ve iş mantığı hataları uygun HTTP durumlarına çevrilir.

Örnek:

```text
Cihaz bulunamadı
      ↓
404
```

```text
Duplicate device IP
      ↓
409
```

```text
Duplicate topology link
      ↓
409
```

```text
Geçersiz request body
      ↓
422
```

---

# 13. Frontend API Kullanımı

Frontend tarafındaki genel veri akışı:

```text
React Page
   ↓
Hook
   ↓
API module
   ↓
Axios client
   ↓
FastAPI
```

Örneğin topology:

```text
Topology.tsx
     ↓
useTopology()
     ↓
getTopologyLinks()
     ↓
GET /api/v1/topology/links
     ↓
FastAPI
```

Metrics:

```text
Metrics.tsx
     ↓
useMetrics()
     ↓
Metrics API
     ↓
FastAPI
```

Alerts:

```text
Alerts.tsx
     ↓
useAlerts()
     ↓
Alerts API
     ↓
FastAPI
```

---

# 14. CORS

FastAPI uygulaması frontend geliştirme ortamı için CORS middleware kullanmaktadır.

İzin verilen geliştirme origin'leri:

```text
http://localhost:5173
http://127.0.0.1:5173
```

Backend:

```text
http://127.0.0.1:8000
```

Frontend:

```text
http://localhost:5173
```

şeklinde çalıştırılabilir.

---

# 15. Swagger ile API Testi

Geliştirme sırasında API testleri FastAPI Swagger üzerinden yapılabilir.

Adres:

```text
http://127.0.0.1:8000/docs
```

Önerilen test sırası:

```text
1. Devices
2. SSH Credentials
3. Monitoring
4. Metrics
5. Alerts
6. Topology
```

Topology için örnek doğrulama:

```text
POST /api/v1/topology/links
        ↓
201 Created

GET /api/v1/topology/links
        ↓
200 OK

DELETE /api/v1/topology/links/{id}
        ↓
başarılı
```

---

# 16. API ile Veritabanı İlişkisi

API kaynaklarının database karşılığı:

```text
/devices
      ↓
devices

/device/{id}/ssh-credentials
      ↓
device_credentials

metrics
      ↓
metrics

/alerts
      ↓
alerts

/topology/links
      ↓
device_links
```

Katmanlar:

```text
HTTP
 ↓
FastAPI Router
 ↓
Pydantic Schema
 ↓
Service
 ↓
Repository
 ↓
SQLAlchemy Model
 ↓
PostgreSQL
```

---

# 17. API Güvenliği

SSH password değerleri API response'larında açık şekilde döndürülmez.

Credential oluşturma/güncelleme sırasında:

```text
Request password
      ↓
Service
      ↓
encrypt_secret()
      ↓
PostgreSQL
```

Monitoring sırasında:

```text
PostgreSQL
      ↓
decrypt_secret()
      ↓
SSH collector
```

Şifreleme anahtarı:

```text
CREDENTIAL_ENCRYPTION_KEY
```

environment değişkeninden alınır.

Gerçek secret değerleri:

```text
.env
```

içerisinde tutulmalı ve source control'e eklenmemelidir.

---

# 18. API'nin Genel Veri Akışı

```text
                         ┌──────────────┐
                         │   Frontend   │
                         └──────┬───────┘
                                │
                              Axios
                                │
                                ▼
                         ┌──────────────┐
                         │   FastAPI    │
                         │     API      │
                         └──────┬───────┘
                                │
                         Pydantic Schema
                                │
                                ▼
                         ┌──────────────┐
                         │   Service    │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │ Repository   │
                         └──────┬───────┘
                                │
                             SQLAlchemy
                                │
                                ▼
                         ┌──────────────┐
                         │ PostgreSQL   │
                         └──────────────┘
```

Monitoring özelinde:

```text
Scheduler
   ↓
MonitoringService
   ↓
Ping / SSH
   ↓
Metrics + Alerts
   ↓
PostgreSQL
   ↓
FastAPI
   ↓
Frontend
```

---

# 19. API Dokümantasyonunun Güncel Tutulması

Yeni bir endpoint eklendiğinde aşağıdakiler birlikte güncellenmelidir:

```text
FastAPI Router
Pydantic Schema
Service
Repository
tests
docs/api.md
```

Endpoint davranışının nihai doğrulaması:

```text
Swagger / OpenAPI
```

üzerinden yapılmalıdır.

API değişikliklerinde migration gerekiyorsa ayrıca:

```text
Alembic migration
```

oluşturulmalıdır.
