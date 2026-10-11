# Network Monitoring Dashboard — Architecture

## 1. Proje Amacı

Network Monitoring Dashboard, ağ üzerindeki cihazların erişilebilirlik durumunu ve temel sistem metriklerini düzenli olarak izlemek, ölçümleri veritabanında saklamak, eşik aşımlarında alarm üretmek ve bu verileri web tabanlı bir dashboard üzerinden görselleştirmek amacıyla geliştirilmiştir.

Sistem temel olarak aşağıdaki akışı izler:

```text
Cihaz
  │
  ├── Ping ───────────────► Erişilebilirlik
  │
  └── SSH
       │
       ├── CPU
       ├── RAM
       ├── Disk
       └── Uptime
              │
              ▼
        Monitoring Service
              │
       ┌──────┴──────┐
       ▼             ▼
    Metrics        Alerts
       │             │
       └──────┬──────┘
              ▼
          PostgreSQL
              │
              ▼
          FastAPI API
              │
              ▼
        React Frontend
```

---

## 2. Genel Mimari

Proje, backend tarafında katmanlı ve modüler bir yapı kullanmaktadır.

```text
network-monitor-dashboard/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── collectors/
│   │   ├── core/
│   │   ├── enums/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── tasks/
│   │   └── utils/
│   │
│   ├── alembic/
│   └── tests/
│
├── frontend/
│
├── simulator/
│
└── docs/
```

Mimari içerisindeki ana sorumluluklar:

```text
API
 ↓
Service
 ↓
Repository
 ↓
SQLAlchemy Model
 ↓
PostgreSQL
```

Monitoring tarafında ise:

```text
Scheduler
 ↓
MonitoringService
 ├── Ping Collector
 ├── SSH Collector
 └── System Metrics Parser
        ↓
     Metrics / Alerts
```

---

## 3. Backend Katmanları

### 3.1 API Layer

Konum:

```text
backend/app/api/v1/
```

API katmanı HTTP isteklerini karşılar ve uygun service katmanına yönlendirir.

Mevcut endpoint grupları:

```text
/api/v1/devices
/api/v1/monitoring
/api/v1/alerts
/api/v1/dashboard
/api/v1/topology
```

Başlıca dosyalar:

```text
alerts.py
dashboard.py
device.py
monitoring.py
topology.py
```

API katmanı içerisinde temel olarak şu işlemler gerçekleştirilir:

- HTTP request alma
- Path/query/body parametrelerini alma
- Pydantic schema ile validation
- Service çağrısı
- Uygun HTTP status code döndürme
- Hataları HTTP response'a dönüştürme

İş mantığının API dosyalarında tutulmaması hedeflenmiştir.

---

### 3.2 Service Layer

Konum:

```text
backend/app/services/
```

Service katmanı uygulamanın iş mantığını içerir.

Mevcut service'ler:

```text
alert_service.py
dashboard_service.py
device_credential_service.py
device_link_service.py
device_service.py
metrics_service.py
monitoring_service.py
```

Özellikle `MonitoringService`, sistemin temel orkestrasyon katmanıdır.

Ana akış:

```text
check_device()
    │
    ├── Device'i getir
    │
    ├── Ping kontrolü
    │
    ├── Offline ise
    │     ├── Device status = Offline
    │     └── Offline alarmı
    │
    └── Online ise
          ├── Offline alarmını resolve et
          ├── Latency kontrolü
          ├── Packet loss kontrolü
          ├── SSH credential al
          ├── Sistem metriklerini topla
          ├── CPU/RAM/Disk alarm kontrolü
          ├── Device güncelle
          └── Metrics kaydet
```

Bu yapı sayesinde API, collector ve database işlemleri birbirine doğrudan bağımlı hale getirilmemektedir.

---

## 4. Collector Layer

Konum:

```text
backend/app/collectors/
```

Collector'ların görevi dış sistemlerden veri toplamaktır.

### Ping Collector

```text
ping_collector.py
```

ICMP tabanlı host erişilebilirliği ve temel ağ ölçümlerini toplar.

Toplanan temel bilgiler:

```text
is_alive
latency_ms
packet_loss
packets_sent
packets_received
```

### SSH Collector

```text
ssh_collector.py
```

SSH üzerinden uzak cihazlara bağlanır ve komut çalıştırır.

Collector:

- SSH bağlantısı kurar
- Retry mekanizması uygular
- Timeout kullanır
- Bir bağlantı üzerinden birden fazla komut çalıştırabilir
- Her başarısız denemede yeni SSH client oluşturur
- Hata durumlarını loglar

SSH bağlantısı cihaz bazlı credential bilgileri kullanılarak gerçekleştirilir.

### System Collector

```text
system_collector.py
```

SSH üzerinden alınan ham Linux çıktılarının anlamlı sistem metriklerine dönüştürülmesinden sorumludur.

Örnek kaynaklar:

```text
/proc/stat
free -m
df -k /
/proc/uptime
```

Çıktılar aşağıdaki metriklere dönüştürülür:

```text
CPU usage
RAM usage
Disk total
Disk used
Uptime
```

---

## 5. Repository Layer

Konum:

```text
backend/app/repositories/
```

Repository katmanı database erişimini soyutlar.

Mevcut repository'ler:

```text
alert_repository.py
device_credential_repository.py
device_link_repository.py
device_repository.py
metrics_repository.py
```

Örneğin:

```text
Service
   ↓
DeviceRepository
   ↓
SQLAlchemy
   ↓
PostgreSQL
```

Service katmanı doğrudan SQL sorguları yazmak yerine repository üzerinden database işlemlerini gerçekleştirir.

Bunun başlıca amacı:

- database erişimini merkezileştirmek
- service katmanını sadeleştirmek
- tekrar eden sorguları azaltmak
- test edilebilirliği artırmak
- veri erişim mantığını iş mantığından ayırmak

---

## 6. Model Layer

Konum:

```text
backend/app/models/
```

SQLAlchemy modelleri PostgreSQL tablolarını temsil eder.

Mevcut ana modeller:

```text
Device
DeviceCredential
DeviceLink
Metrics
Alert
```

### Device

Cihazın temel bilgilerini ve mevcut durumunu temsil eder.

Örnek alanlar:

```text
id
hostname
ip_address
device_type
status
created_at
last_checked
is_active
location
```

### DeviceCredential

Cihazlara ait SSH bağlantı bilgilerinin saklandığı tablodur.

Her aktif cihaz için cihaz bazlı SSH bağlantı bilgisi tutulabilir.

Şifre plaintext olarak response'a gönderilmez; veritabanında Fernet tabanlı şifrelenmiş değer olarak saklanır.

### Metrics

Cihazlardan zaman içerisinde toplanan ölçümlerin tarihsel kaydını tutar.

Örnek:

```text
device_id
cpu_usage
ram_usage
disk_total_gb
disk_used_gb
latency_ms
packet_loss
uptime_seconds
timestamp
```

### Alert

Eşik aşımı veya erişilebilirlik problemi gibi olayları temsil eder.

Alarm yaşam döngüsü:

```text
Open
  ↓
Problem devam ediyor
  ↓
Resolved
```

Aynı alarm türünün gereksiz şekilde sürekli oluşturulmasını engellemek için mevcut açık alarm kontrolü uygulanır.

### DeviceLink

Topoloji ekranındaki cihazlar arasındaki bağlantıları temsil eder.

```text
source_device_id
target_device_id
link_type
status
created_at
updated_at
```

Aynı cihazın kendisine bağlanması ve aynı/reverse bağlantının tekrar oluşturulması service katmanında engellenir.

---

## 7. Schema Layer

Konum:

```text
backend/app/schemas/
```

Pydantic schema'ları API ile backend arasındaki veri sözleşmesini belirler.

Örnek schema grupları:

```text
device.py
device_credential.py
device_link.py
metrics.py
alert.py
dashboard.py
monitoring.py
```

Örneğin:

```text
Frontend
   ↓ JSON
Pydantic Schema
   ↓ validation
Service
```

Credential response'larında SSH password alanı döndürülmez.

---

## 8. Security

Konum:

```text
backend/app/core/security.py
```

SSH credential password değerleri Fernet kullanılarak şifrelenir.

Temel akış:

```text
Plain password
      ↓
encrypt_secret()
      ↓
Encrypted value
      ↓
PostgreSQL
```

Monitoring sırasında:

```text
PostgreSQL
      ↓
Encrypted value
      ↓
decrypt_secret()
      ↓
SSH connection
```

Encryption key uygulama yapılandırması üzerinden:

```text
CREDENTIAL_ENCRYPTION_KEY
```

ile sağlanmaktadır.

Secret değerlerinin API response'larında döndürülmemesi hedeflenmiştir.

---

## 9. Configuration

Konum:

```text
backend/app/core/config.py
```

Uygulama ayarları environment değişkenlerinden alınır.

Önemli ayar grupları:

```text
Database
Ping
Monitoring interval
Concurrency limit
CPU threshold
RAM threshold
Disk threshold
Latency threshold
Packet loss threshold
Credential encryption
SSH retry
SSH timeout
```

Gizli veya ortama özel değerler `.env` içerisinde tutulur.

Repository'ye paylaşılacak örnek yapı:

```text
.env
.env.example
```

`.env` gerçek secret değerleri içerirken `.env.example` sadece örnek yapı içerir.

---

## 10. Scheduler ve Monitoring

Konum:

```text
backend/app/tasks/scheduler.py
```

Monitoring işlemleri APScheduler kullanılarak periyodik olarak çalıştırılır.

Genel akış:

```text
Application Startup
      ↓
Scheduler Start
      ↓
Monitoring interval
      ↓
Active devices
      ↓
Concurrency control
      ↓
MonitoringService.check_device()
      ↓
Database
```

Scheduler tarafında:

- async scheduler kullanılır
- aktif cihazlar izlenir
- eşzamanlı cihaz sayısı semaphore ile sınırlandırılır
- aynı job'un üst üste çalışması engellenir
- coalescing kullanılır
- uygulama kapanırken scheduler durdurulur

Uygulama ilk açıldığında monitoring işleminin doğrudan aynı anda başlamaması için ilk çalışma interval sonrasına bırakılmıştır.

---

## 11. Database ve Migration

Veritabanı:

```text
PostgreSQL
```

ORM:

```text
SQLAlchemy
```

Migration:

```text
Alembic
```

Migration zinciri mevcut durumda tek head üzerinden ilerlemektedir.

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

`093c6928c2f7`, `device_links` tablosunun oluşturulmasını içeren mevcut head migration'dır.

---

## 12. Frontend Architecture

Frontend:

```text
React
TypeScript
Vite
Tailwind CSS
Axios
Recharts
React Router
Lucide React
@xyflow/react
```

Ana yapı:

```text
frontend/src/
├── api/
├── charts/
├── components/
├── hooks/
├── pages/
├── topology/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

### Pages

Mevcut ana ekranlar:

```text
Dashboard
Devices
DeviceDetail
Metrics
Alerts
Topology
```

### API Layer

Frontend'de Axios tabanlı API istemcisi kullanılır.

```text
React Page
   ↓
Hook
   ↓
API module
   ↓
Axios
   ↓
FastAPI
```

### Hooks

Hook'lar API verilerinin UI tarafında kullanılmasını ve periyodik yenileme gibi işlemleri yönetir.

Örnek:

```text
useDevices
useMetrics
useAlerts
useTopology
useDeviceHealth
```

### Charts

Recharts ile zaman serisi ve istatistik görselleştirmeleri yapılır.

Dashboard ve Device Detail ekranlarında CPU, RAM, disk ve latency gibi metrikler grafiklerle gösterilir.

### Topology

`@xyflow/react` kullanılarak cihaz topolojisi görselleştirilir.

```text
Device
   ↓
React Flow Node

DeviceLink
   ↓
React Flow Edge
```

Topoloji verileri backend'deki:

```text
/api/v1/topology/links
```

endpoint'inden alınır.

---

## 13. Backend–Frontend Veri Akışı

Örnek cihaz listeleme akışı:

```text
Browser
  │
  │ GET /api/v1/devices
  ▼
FastAPI Router
  │
  ▼
DeviceService
  │
  ▼
DeviceRepository
  │
  ▼
SQLAlchemy
  │
  ▼
PostgreSQL
  │
  ▼
Pydantic Response
  │
  ▼
Axios
  │
  ▼
React Hook
  │
  ▼
Page Component
```

Topoloji için:

```text
DeviceLink table
      ↓
DeviceLinkRepository
      ↓
DeviceLinkService
      ↓
Topology API
      ↓
useTopology()
      ↓
Topology.tsx
      ↓
React Flow
```

---

## 14. Monitoring Veri Akışı

Bir cihaz için tipik monitoring işlemi:

```text
1. Device yüklenir
      ↓
2. Ping gönderilir
      ↓
3. Cihaz erişilemiyorsa Offline yapılır
      ↓
4. Offline alarmı oluşturulur / açık alarm korunur
      ↓
5. Cihaz erişilebiliyorsa Online yapılır
      ↓
6. Latency ve packet loss kontrol edilir
      ↓
7. SSH credential alınır
      ↓
8. SSH ile sistem komutları çalıştırılır
      ↓
9. CPU için iki snapshot alınır
      ↓
10. System metrics parse edilir
      ↓
11. CPU/RAM/Disk eşikleri kontrol edilir
      ↓
12. Alarm oluşturulur veya mevcut alarm çözülür
      ↓
13. Device güncellenir
      ↓
14. Metrics kaydı oluşturulur
      ↓
15. PostgreSQL'e kaydedilir
```

---

## 15. Error Handling

Sistem hataları katmanlı olarak ele alınır.

### Collector

Bağlantı veya komut hataları exception olarak service katmanına iletilir.

### Service

İş mantığı seviyesindeki hatalar:

- `ValueError`
- `LookupError`
- `RuntimeError`

gibi uygun exception türleriyle işlenir.

### API

Service katmanındaki hatalar uygun HTTP status kodlarına dönüştürülür.

Örneğin topology işlemlerinde:

```text
404 → Cihaz veya bağlantı bulunamadı
409 → Çakışan veya tekrar eden bağlantı
```

### Logging

Konum:

```text
backend/app/utils/logger.py
```

Uygulama için merkezi logger kullanılır.

Önemli monitoring olayları:

```text
INFO
WARNING
ERROR
```

seviyelerinde loglanır.

Paramiko'nun düşük seviyeli logları uygulama loglarının gürültüsünü azaltmak için sınırlandırılmıştır.

---

## 16. Test Architecture

Testler iki ana gruba ayrılmıştır:

```text
backend/tests/
├── unit/
│   └── test_system_collector.py
│
└── integration/
    ├── test_monitoring.py
    ├── test_ping.py
    ├── test_ssh.py
    └── test_system_ssh.py
```

### Unit Test

`system_collector` izole şekilde test edilir.

Amaç:

```text
Raw system output
      ↓
Parser
      ↓
Expected metric values
```

### Integration Tests

Gerçek bileşenlerin birlikte çalışması test edilir:

```text
Ping
SSH
System metrics
MonitoringService
PostgreSQL
```

SSH entegrasyon testleri için:

```text
simulator/fake-device-agent/
```

altındaki Docker tabanlı sahte SSH cihazı kullanılmaktadır.

---

## 17. Simulator Architecture

Konum:

```text
simulator/fake-device-agent/
```

Simulator amacı gerçek bir ağ cihazı olmadan SSH monitoring senaryosunu geliştirme ortamında test edebilmektir.

Temel yapı:

```text
Docker
  ↓
Ubuntu 24.04
  ↓
OpenSSH Server
  ↓
monitor user
  ↓
SSH port 22
  ↓
Host port 2222
```

Backend bu cihazı aşağıdaki bilgilerle test edebilir:

```text
IP: 127.0.0.1
Port: 2222
Username: monitor
```

---

## 18. Concurrency ve Async Yapı

Backend async FastAPI ve SQLAlchemy AsyncSession kullanır.

CPU-bound veya blocking işlemlerin event loop'u bloklamaması için özellikle:

```python
asyncio.to_thread(...)
```

kullanılmıştır.

Örnek:

```text
FastAPI Event Loop
       │
       ├── Async DB
       │
       └── asyncio.to_thread()
                  ↓
             Blocking Ping
                  ↓
             Blocking SSH
```

Scheduler tarafında semaphore ile aynı anda izlenebilecek cihaz sayısı sınırlandırılır.

Bu yapı yüksek sayıda cihazın izlenmesi sırasında event loop üzerindeki baskıyı azaltmayı amaçlar.

---

## 19. Topology Architecture

Topoloji iki temel veri kümesinden oluşur:

```text
Devices
  +
DeviceLinks
```

Node:

```text
Device
```

Edge:

```text
DeviceLink
```

Örneğin:

```text
router-main ─────────► test-device
```

Backend:

```text
DeviceLink
   ↓
GET /api/v1/topology/links
```

Frontend:

```text
useTopology()
   ↓
Topology.tsx
   ↓
React Flow
```

Bağlantı tipi ve durumu ayrıca tutulur:

```text
ethernet
fiber
wireless
vpn
other
```

ve:

```text
up
down
unknown
```

---

## 20. Deployment Yaklaşımı

Geliştirme ortamında sistem temel olarak şu parçalardan oluşur:

```text
Browser
   │
   ▼
React + Vite
   │
   ▼
FastAPI
   │
   ├────────► PostgreSQL
   │
   └────────► SSH Devices
                    │
                    ▼
              Docker Simulator
```

Frontend ve backend ayrı olarak çalıştırılabilir.

SSH test cihazı Docker Compose üzerinden başlatılır.

---

## 21. Mimari Tasarım Hedefleri

Bu mimaride temel hedefler şunlardır:

```text
Modülerlik
Separation of Concerns
Test edilebilirlik
Bakımı kolaylaştırma
Güvenli credential yönetimi
Asenkron çalışma
Kontrollü concurrency
Merkezi logging
Migration yönetimi
Frontend/backend ayrımı
```

Her katmanın mümkün olduğunca tek bir sorumluluğa sahip olması hedeflenmiştir.

---

## 22. Özet Mimari

```text
                         ┌───────────────────────┐
                         │       React UI        │
                         │ Dashboard / Devices   │
                         │ Metrics / Alerts      │
                         │ Topology              │
                         └───────────┬───────────┘
                                     │
                                   Axios
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │       FastAPI         │
                         │      API Layer        │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │     Service Layer     │
                         │ Monitoring / Alert    │
                         │ Device / Metrics      │
                         │ Topology / Dashboard  │
                         └──────┬─────────┬──────┘
                                │         │
                    ┌───────────┘         └───────────┐
                    ▼                                 ▼
             ┌──────────────┐                  ┌──────────────┐
             │  Collectors  │                  │ Repositories │
             │ Ping / SSH   │                  │ Data Access  │
             │ System       │                  └──────┬───────┘
             └──────┬───────┘                         │
                    │                                 ▼
                    │                         ┌──────────────┐
                    │                         │  SQLAlchemy  │
                    │                         └──────┬───────┘
                    │                                │
                    │                                ▼
                    │                         ┌──────────────┐
                    └────────────────────────►│ PostgreSQL   │
                                              └──────────────┘

                 Scheduler
                    │
                    ▼
             MonitoringService
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
       Metrics              Alerts
```

Bu mimari, backend'deki veri toplama, iş mantığı, veri erişimi ve HTTP katmanlarını birbirinden ayırırken frontend'i REST API üzerinden backend'den bağımsız tutmaktadır.
