# Network Monitoring Dashboard — Demo Scenario

## 1. Demo Senaryosunun Amacı

Bu doküman, Network Monitoring Dashboard projesinin geliştirme ortamında uçtan uca nasıl çalıştırılacağını ve temel monitoring akışının nasıl gösterileceğini açıklar.

Demo ortamında gerçek bir fiziksel ağ cihazı yerine Docker üzerinde çalışan bir SSH simulator kullanılmaktadır.

Temel yapı:

```text
Docker SSH Simulator
        ↓
FastAPI Backend
        ↓
PostgreSQL
        ↓
React Frontend
```

Demo sırasında aşağıdaki zincirin gösterilmesi hedeflenir:

```text
Device
  ↓
Ping
  ↓
Online
  ↓
SSH
  ↓
CPU / RAM / Disk / Uptime
  ↓
Metrics
  ↓
Alert
  ↓
Dashboard
  ↓
Topology
```

---

## 2. Demo Ortamı

Demo için temel bileşenler:

```text
Backend    : FastAPI + Uvicorn
Database   : PostgreSQL
Frontend   : React + Vite
Simulator  : Docker + Ubuntu + OpenSSH
```

SSH simulator:

```text
Host IP   : 127.0.0.1
Host Port : 2222
SSH Port  : 22
Username  : monitor
```

Simulator container adı:

```text
network-monitor-ssh-device
```

---

## 3. Demo Öncesi Kontrol

Demo başlamadan önce Docker container'ın çalıştığı doğrulanmalıdır.

Proje kök dizininde:

```powershell
docker compose up -d
```

Sonra:

```powershell
docker ps
```

Beklenen yapı:

```text
network-monitor-ssh-device
```

container'ının `Up` durumunda olmasıdır.

Backend için:

```powershell
cd backend
uvicorn app.main:app --reload
```

Frontend için yeni bir terminal:

```powershell
cd frontend
npm.cmd run dev
```

Geliştirme ortamındaki tipik adresler:

```text
Backend  : http://127.0.0.1:8000
Swagger  : http://127.0.0.1:8000/docs
Frontend : http://localhost:5173
```

---

## 4. Simulator'ın SSH Olarak Kontrol Edilmesi

SSH simulator çalışırken doğrudan SSH bağlantısı kurulabilir:

```powershell
ssh monitor@127.0.0.1 -p 2222
```

Password:

```text
monitor123
```

Bağlantı kurulduktan sonra:

```bash
whoami
```

komutu:

```text
monitor
```

döndürmelidir.

Sistem metriklerini görmek için:

```bash
free -m
```

```bash
df -k /
```

```bash
cat /proc/uptime
```

```bash
cat /proc/stat | head -n 1
```

komutları kullanılabilir.

Bu komutlar monitoring collector'ın kullandığı temel Linux kaynaklarıdır.

---

# 5. Demo Cihazı

Projede demo için kullanılan cihaz:

```text
ID       : 3
Hostname : test-device
IP       : 127.0.0.1
Type     : Server
Location : Test
```

SSH credential:

```text
Port     : 2222
Username : monitor
```

Cihazın backend tarafında `Online` olması için simulator'ın çalışır durumda olması gerekir.

---

# 6. SSH Credential Tanımlama

Cihaz için SSH credential API üzerinden tanımlanır.

Endpoint:

```http
PUT /api/v1/devices/3/ssh-credentials
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

Başarılı işlemden sonra response içerisinde:

```text
username
port
enabled
created_at
updated_at
```

gibi bilgiler bulunur.

Password response'a gönderilmez.

Backend tarafında password şifrelenmiş olarak saklanır.

---

# 7. Monitoring Testi

Tek bir cihazı manuel olarak kontrol etmek için monitoring service:

```text
MonitoringService.check_device(3)
```

akışını çalıştırır.

İşlem sırası:

```text
1. Device ID 3 alınır
2. Ping gönderilir
3. Ping başarılıysa device Online yapılır
4. Latency kontrol edilir
5. Packet loss kontrol edilir
6. SSH credential alınır
7. SSH ile sistem komutları çalıştırılır
8. CPU için ilk snapshot alınır
9. RAM / Disk / Uptime alınır
10. 1 saniye beklenir
11. CPU için ikinci snapshot alınır
12. CPU kullanımı hesaplanır
13. Threshold kontrolleri yapılır
14. Device güncellenir
15. Metrics kaydı oluşturulur
```

---

# 8. Metrics Kaydının Oluşması

Başarılı monitoring sonucunda `metrics` tablosuna yeni kayıt eklenir.

Örnek veri:

```json
{
  "device_id": 3,
  "cpu_usage": 0,
  "ram_usage": 5,
  "disk_total_gb": 1007,
  "disk_used_gb": 24,
  "latency_ms": 0.5,
  "packet_loss": 0,
  "uptime_seconds": 459
}
```

Değerler cihazın gerçek çalışma anındaki sonuçlarına göre değişebilir.

Metrics kayıtları zaman serisi oluşturur:

```text
21:30 → metrics
21:31 → metrics
21:32 → metrics
21:33 → metrics
...
```

Bu veriler:

```text
Dashboard
Metrics
Device Detail
```

ekranlarında kullanılır.

---

# 9. Dashboard Demo

Frontend'de:

```text
http://localhost:5173/
```

adresine gidilir.

Dashboard üzerinde temel olarak:

```text
Device status
CPU
RAM
Disk
Network
Alerts
Device health
```

verileri görüntülenir.

Demo sırasında özellikle `test-device` seçilerek canlı monitoring verisinin dashboard'a geldiği gösterilebilir.

Dashboard verileri belirli aralıklarla yenilenir.

---

# 10. Device Detail Demo

Cihaz listesinde:

```text
test-device
```

seçilir.

Cihaz detay ekranında:

```text
CPU
RAM
Disk
Latency
```

gibi metrikler grafiklerle görüntülenir.

Ayrıca:

```text
Device Information
Runtime
Active Alerts
```

bölümleri bulunmaktadır.

Burada zaman aralığı değiştirildiğinde farklı metrics kayıtlarının grafiklere yansıması gösterilebilir.

---

# 11. Metrics Explorer Demo

Frontend menüsünden:

```text
Metrik Analizi
```

ekranına gidilir.

Bir cihaz seçilir.

Ardından zaman aralığı seçilebilir:

```text
1h
6h
24h
7d
```

Burada:

```text
CPU
RAM
Disk
Latency
```

metriklerinin tarihsel değişimi incelenebilir.

Tablo bölümünde ayrıca timestamp bazlı ham metrics kayıtları görülebilir.

---

# 12. Alert Demo

Alarm oluşturma mantığını göstermek için monitoring threshold değerleri kullanılabilir.

Örneğin CPU threshold:

```text
high_cpu_threshold_percent
```

değerinin üzerinde CPU kullanımında:

```text
HighCPU
```

alarmı oluşturulur.

Benzer şekilde:

```text
HighRAM
HighDisk
HighLatency
HighPacketLoss
Offline
```

alarm türleri de bulunmaktadır.

Alarm yaşam döngüsü:

```text
Problem oluşur
     ↓
Alarm Open
     ↓
Problem devam eder
     ↓
Aynı açık alarm tekrar tekrar oluşturulmaz
     ↓
Problem normale döner
     ↓
Alarm Resolved
```

---

# 13. Offline Senaryosu

Offline durumunu göstermek için simulator durdurulabilir.

Örneğin:

```powershell
docker compose stop
```

Bu durumda:

```text
SSH erişimi yok
```

olmasının yanında ping sonucu da ortam koşullarına göre başarısız olabilir.

Monitoring sonucunda cihaz:

```text
Offline
```

durumuna geçebilir ve:

```text
Offline
```

alarm lifecycle'ı çalışır.

Daha sonra simulator tekrar başlatılır:

```powershell
docker compose up -d
```

Cihaz yeniden erişilebilir hale geldiğinde monitoring:

```text
Offline → Online
```

durum geçişini gerçekleştirebilir ve açık Offline alarmını resolve edebilir.

---

# 14. Topology Demo

Frontend'de:

```text
Ağ Topolojisi
```

ekranına gidilir.

Topoloji backend'deki `device_links` verisi üzerinden oluşturulur.

Mevcut demo bağlantısı:

```text
router-main
      │
      │ ethernet
      ▼
test-device
```

Bağlantı backend'den:

```http
GET /api/v1/topology/links
```

ile alınır.

Frontend tarafında:

```text
useTopology()
       ↓
Topology.tsx
       ↓
React Flow
```

akışı kullanılır.

Topoloji ekranında ayrıca:

```text
Total Devices
Online
Offline
Pending
Connections
```

özetleri görülebilir.

---

# 15. Topology Bağlantısı Oluşturma

Swagger üzerinden yeni bir bağlantı oluşturulabilir:

```http
POST /api/v1/topology/links
```

Örnek:

```json
{
  "source_device_id": 1,
  "target_device_id": 3,
  "link_type": "ethernet",
  "status": "up"
}
```

Başarılı olursa:

```text
201 Created
```

döner.

Daha sonra:

```http
GET /api/v1/topology/links
```

çağrılarak bağlantının kaydedildiği doğrulanır.

Frontend Topology ekranı yenilendiğinde bağlantı grafikte görünür.

---

# 16. Duplicate Topology Testi

Mevcut bağlantı:

```text
1 → 3
```

iken aynı bağlantının tekrar oluşturulması denenebilir.

```json
{
  "source_device_id": 1,
  "target_device_id": 3,
  "link_type": "ethernet",
  "status": "up"
}
```

Beklenen sonuç:

```text
409 Conflict
```

Ters yön:

```text
3 → 1
```

de aynı bağlantı çifti olarak değerlendirilir ve service katmanındaki kontrol nedeniyle reddedilir.

---

# 17. API Demo Sırası

Swagger üzerinden gösterim için önerilen akış:

```text
1. GET Devices
        ↓
2. GET Device Detail
        ↓
3. PUT SSH Credentials
        ↓
4. Monitoring
        ↓
5. GET Metrics
        ↓
6. GET Alerts
        ↓
7. POST Topology Link
        ↓
8. GET Topology Links
```

---

# 18. Frontend Demo Sırası

Sunum sırasında frontend için aşağıdaki akış kullanılabilir:

```text
Dashboard
   ↓
Cihazlar
   ↓
test-device
   ↓
Device Detail
   ↓
Metrik Analizi
   ↓
Alarm Merkezi
   ↓
Ağ Topolojisi
```

Bu sıra, projenin temel özelliklerini tek bir cihaz üzerinden göstermeye uygundur.

---

# 19. Demo İçin Önemli Noktalar

Demo sırasında backend çalışır durumda olmalıdır:

```text
uvicorn app.main:app --reload
```

SSH simulator çalışır durumda olmalıdır:

```text
docker compose up -d
```

Frontend çalışır durumda olmalıdır:

```text
npm.cmd run dev
```

Ayrıca:

```text
CREDENTIAL_ENCRYPTION_KEY
```

gibi gerekli environment değerlerinin `.env` içerisinde tanımlı olması gerekir.

---

# 20. Demo Sonrası Kontroller

Demo sonrasında aşağıdakiler kontrol edilebilir:

```powershell
python -m pytest -q
```

Beklenen:

```text
5 passed
```

Frontend production build:

```powershell
npm.cmd run build
```

Alembic durumu:

```powershell
alembic current
```

Beklenen head:

```text
093c6928c2f7 (head)
```

---

# 21. Uçtan Uca Demo Özeti

```text
                    ┌───────────────────┐
                    │ Docker SSH Device │
                    │   test-device     │
                    └─────────┬─────────┘
                              │
                         Ping + SSH
                              │
                              ▼
                    ┌───────────────────┐
                    │ MonitoringService │
                    └─────────┬─────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
              Metrics       Alerts       Device
                 │            │            │
                 └────────────┼────────────┘
                              ▼
                       ┌─────────────┐
                       │ PostgreSQL  │
                       └──────┬──────┘
                              │
                              ▼
                         FastAPI API
                              │
                              ▼
                        React Frontend
                              │
       ┌──────────────┬───────┼────────┬──────────────┐
       ▼              ▼       ▼        ▼              ▼
   Dashboard       Devices  Metrics  Alerts       Topology
```

Bu demo senaryosu, projenin cihaz yönetimi, gerçek ping/SSH monitoring, sistem metrikleri, alarm lifecycle'ı, tarihsel metrics ve gerçek topology verisinin frontend'e aktarılması dahil olmak üzere temel uçtan uca çalışma akışını göstermek için kullanılabilir.
