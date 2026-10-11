# Network Monitoring Dashboard

Modern ağ cihazlarını merkezi bir panel üzerinden izlemek, sistem metriklerini toplamak, alarmları yönetmek ve ağ topolojisini görselleştirmek amacıyla geliştirilmiş full-stack bir Network Monitoring Dashboard projesidir.

Proje; **FastAPI + PostgreSQL + SQLAlchemy + Alembic + React + TypeScript** temeli üzerine kurulmuştur.

---

## Projenin Amacı

Bu projenin temel amacı, ağ üzerindeki cihazların durumunu merkezi bir sistem üzerinden takip etmektir.

Sistem;

- cihazların erişilebilirliğini Ping/ICMP ile kontrol eder,
- erişilebilir cihazlardan SSH üzerinden sistem metrikleri toplar,
- CPU, RAM, disk, latency, packet loss ve uptime gibi verileri saklar,
- belirlenen eşiklere göre alarm oluşturur ve alarm yaşam döngüsünü yönetir,
- cihazlar arasındaki bağlantıları ağ topolojisi üzerinde gösterir,
- toplanan verileri dashboard ve grafikler üzerinden kullanıcıya sunar.

Proje aynı zamanda gerçek cihazlara geçmeden önce kullanılabilen Docker tabanlı bir SSH test cihazı simulatorüne sahiptir.

---

# Temel Özellikler

## Cihaz Yönetimi

Her ağ cihazı için temel bilgiler tutulabilir:

```text
ID
Hostname
IP Address
Device Type
Status
Location
Created At
Last Checked
Active / Inactive
```

Desteklenen temel cihaz tipleri proje içerisinde enum yapısıyla yönetilmektedir.

---

## Monitoring

Monitoring süreci periyodik olarak scheduler tarafından çalıştırılır.

Genel akış:

```text
Scheduler
    ↓
Active Devices
    ↓
Ping
    ↓
Reachable?
   / \
 No   Yes
 ↓     ↓
Offline  SSH
          ↓
   System Metrics
          ↓
       Metrics
          ↓
        Alerts
```

Monitoring sistemi erişilebilir cihazlar için SSH üzerinden sistem verileri toplar.

Toplanan temel metrikler:

```text
CPU Usage
RAM Usage
Disk Usage
Uptime
Latency
Packet Loss
Timestamp
```

---

# Alarm Sistemi

Sistem belirlenen eşiklere göre alarm oluşturabilir.

Desteklenen temel alarm türleri:

```text
Offline
High Latency
High Packet Loss
High CPU
High RAM
High Disk
```

Alarm yaşam döngüsünde mevcut problemin aktifleşmesi, devam etmesi ve normale dönmesi takip edilir.

---

# Ağ Topolojisi

Ağ cihazları arasındaki bağlantılar `DeviceLink` modeli ile tutulur.

Örneğin:

```text
router-main
      │
      └──────────── test-device
```

Bağlantılar için temel bilgiler:

```text
Source Device
Target Device
Link Type
Status
Created At
Updated At
```

Desteklenen bağlantı tipleri:

```text
ethernet
fiber
wireless
vpn
other
```

Frontend tarafında ağ topolojisi **React Flow** kullanılarak görselleştirilir.

---

# Dashboard

Dashboard üzerinden sistemin genel durumu görüntülenebilir.

Örneğin:

```text
Total Devices
Online Devices
Offline Devices
Pending Devices
Connections
```

Aynı zamanda monitoring ve alarm verilerinin özetleri görüntülenebilir.

---

# Frontend Sayfaları

Frontend React + TypeScript ile geliştirilmiştir.

Mevcut ana sayfalar:

```text
Dashboard
Cihazlar
Device Detail
Metrik Analizi
Alarm Merkezi
Ağ Topolojisi
```

Frontend tarafında ayrıca grafikler, cihaz detayları ve topoloji bileşenleri bulunmaktadır.

---

# Teknoloji Stack

## Backend

| Teknoloji | Kullanım |
|---|---|
| Python | Ana backend dili |
| FastAPI | REST API |
| SQLAlchemy | ORM |
| PostgreSQL | Veritabanı |
| Alembic | Database migration |
| Pydantic | Validation / Schema |
| APScheduler | Periyodik monitoring |
| icmplib | Ping / ICMP |
| Paramiko | SSH bağlantıları |
| Cryptography / Fernet | Credential şifreleme |
| Uvicorn | ASGI server |

## Frontend

| Teknoloji | Kullanım |
|---|---|
| React | UI |
| TypeScript | Tip güvenliği |
| Vite | Frontend build/dev server |
| Tailwind CSS | UI styling |
| Axios | API communication |
| React Router | Routing |
| Recharts | Grafikler |
| Lucide | Icons |
| React Flow | Network topology |

## Infrastructure / Test

| Teknoloji | Kullanım |
|---|---|
| Docker | Simulator |
| Docker Compose | Simulator orchestration |
| Pytest | Backend tests |

---

# Proje Mimarisi

Backend katmanlı ve modüler bir yapıya sahiptir.

```text
Frontend
   │
   ▼
FastAPI API
   │
   ▼
Services
   │
   ▼
Repositories
   │
   ▼
SQLAlchemy Models
   │
   ▼
PostgreSQL
```

Monitoring tarafında:

```text
Scheduler
    │
    ▼
Monitoring Service
    │
    ├── Ping Collector
    │
    └── SSH Collector
             │
             ▼
       System Collector
             │
             ▼
          Metrics
             │
             ▼
           Alerts
```

Topology tarafında:

```text
Frontend
   ↓
Topology API
   ↓
Device Link Service
   ↓
Device Link Repository
   ↓
DeviceLink Model
   ↓
PostgreSQL
```

---

# Klasör Yapısı

```text
network-monitor-dashboard/
│
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
├── LICENSE
├── README.md
├── requirements.txt
│
├── backend/
│   ├── alembic.ini
│   │
│   ├── alembic/
│   │   ├── env.py
│   │   ├── README
│   │   ├── script.py.mako
│   │   └── versions/
│   │
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── alerts.py
│   │   │       ├── dashboard.py
│   │   │       ├── device.py
│   │   │       ├── monitoring.py
│   │   │       └── topology.py
│   │   │
│   │   ├── collectors/
│   │   │   ├── ping_collector.py
│   │   │   ├── ssh_collector.py
│   │   │   └── system_collector.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   │
│   │   ├── enums/
│   │   │   ├── alert_level.py
│   │   │   ├── alert_type.py
│   │   │   ├── device_status.py
│   │   │   ├── device_type.py
│   │   │   └── metric_period.py
│   │   │
│   │   ├── models/
│   │   │   ├── alert.py
│   │   │   ├── device.py
│   │   │   ├── device_credential.py
│   │   │   ├── device_link.py
│   │   │   └── metrics.py
│   │   │
│   │   ├── repositories/
│   │   │   ├── alert_repository.py
│   │   │   ├── device_credential_repository.py
│   │   │   ├── device_link_repository.py
│   │   │   ├── device_repository.py
│   │   │   └── metrics_repository.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── alert.py
│   │   │   ├── dashboard.py
│   │   │   ├── device.py
│   │   │   ├── device_credential.py
│   │   │   ├── device_link.py
│   │   │   ├── metrics.py
│   │   │   └── monitoring.py
│   │   │
│   │   ├── services/
│   │   │   ├── alert_service.py
│   │   │   ├── dashboard_service.py
│   │   │   ├── device_credential_service.py
│   │   │   ├── device_link_service.py
│   │   │   ├── device_service.py
│   │   │   ├── metrics_service.py
│   │   │   └── monitoring_service.py
│   │   │
│   │   ├── tasks/
│   │   │   └── scheduler.py
│   │   │
│   │   └── utils/
│   │       └── logger.py
│   │
│   └── tests/
│       ├── integration/
│       │   ├── test_monitoring.py
│       │   ├── test_ping.py
│       │   ├── test_ssh.py
│       │   └── test_system_ssh.py
│       │
│       └── unit/
│           └── test_system_collector.py
│
├── docs/
│   ├── api.md
│   ├── architecture.md
│   ├── database.md
│   ├── demo-scenario.md
│   └── institution-permission-checklist.md
│
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── index.html
│   └── src/
│       ├── api/
│       ├── charts/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── topology/
│       ├── types/
│       ├── utils/
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
│
└── simulator/
    └── fake-device-agent/
        ├── Dockerfile
        └── entrypoint.sh
```

---

# Gereksinimler

Projeyi çalıştırmadan önce aşağıdaki araçların kurulu olması gerekir:

```text
Python 3.x
PostgreSQL
Node.js
npm
Docker
Git
```

Frontend için Node.js ve npm, simulator için Docker gereklidir.

---

# Backend Kurulumu

Proje klasörüne girin:

```powershell
cd network-monitor-dashboard
```

Sanal ortam oluşturun:

```powershell
python -m venv .venv
```

Sanal ortamı aktif edin:

```powershell
.\.venv\Scripts\Activate.ps1
```

Bağımlılıkları kurun:

```powershell
pip install -r requirements.txt
```

---

# Environment Ayarları

`.env.example` dosyasını temel alarak `.env` oluşturun.

Örneğin:

```text
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:5432/DATABASE

PING_COUNT=4
PING_TIMEOUT=2

MONITORING_INTERVAL_SECONDS=30
MAX_CONCURRENT_DEVICES=20

HIGH_LATENCY_THRESHOLD_MS=100
HIGH_PACKET_LOSS_THRESHOLD_PERCENT=20

HIGH_CPU_THRESHOLD_PERCENT=90
HIGH_RAM_THRESHOLD_PERCENT=90
HIGH_DISK_THRESHOLD_PERCENT=90

CREDENTIAL_ENCRYPTION_KEY=

SSH_RETRIES=3
SSH_TIMEOUT=5
```

Gerçek credential ve secret değerleri `.env` içerisinde tutulmalı, Git repository'sine gönderilmemelidir.

Fernet encryption key oluşturmak için Python kullanılabilir:

```python
from cryptography.fernet import Fernet

print(Fernet.generate_key().decode())
```

Üretilen key:

```text
CREDENTIAL_ENCRYPTION_KEY=...
```

şeklinde `.env` içerisine eklenebilir.

---

# Database Migration

Backend klasörüne geçin:

```powershell
cd backend
```

Migration'ları uygulayın:

```powershell
alembic upgrade head
```

Mevcut migration durumunu kontrol etmek için:

```powershell
alembic current
```

---

# Backend'i Çalıştırma

Projenin kök dizininden:

```powershell
uvicorn app.main:app --reload --app-dir backend
```

Backend varsayılan olarak:

```text
http://127.0.0.1:8000
```

adresinde çalıştırılabilir.

Swagger:

```text
http://127.0.0.1:8000/docs
```

ReDoc:

```text
http://127.0.0.1:8000/redoc
```

---

# Docker SSH Simulator

Gerçek ağ cihazı yerine test amacıyla Ubuntu tabanlı bir SSH simulatorü kullanılabilir.

Simulator:

```text
Ubuntu 24.04
OpenSSH Server
procps
```

kullanır.

Kök dizinden:

```powershell
docker compose up -d
```

Çalışan container'ı kontrol etmek için:

```powershell
docker ps
```

SSH simulator bağlantısı:

```powershell
ssh monitor@127.0.0.1 -p 2222
```

Simulator test credential:

```text
Username: monitor
Password: monitor123
Port: 2222
```

Bu bilgiler yalnızca geliştirme/test simulatorü içindir.

Gerçek kurum cihazlarında bu credential'lar kullanılmamalıdır.

---

# Simulator ile Device Tanımlama

Örneğin simulator için:

```text
Hostname: test-device
IP Address: 127.0.0.1
Device Type: Server
Location: Test
```

SSH credential:

```text
Host: 127.0.0.1
Port: 2222
Username: monitor
Password: monitor123
```

şeklinde yapılandırılabilir.

Gerçek cihazlarda cihazın gerçek IP adresi ve kurum tarafından sağlanan SSH bilgileri kullanılmalıdır.

---

# Frontend Kurulumu

Frontend klasörüne geçin:

```powershell
cd frontend
```

Bağımlılıkları kurun:

```powershell
npm.cmd install
```

Development server:

```powershell
npm.cmd run dev
```

Frontend varsayılan olarak:

```text
http://localhost:5173
```

adresinde çalıştırılabilir.

---

# Frontend Production Build

Production build oluşturmak için:

```powershell
npm.cmd run build
```

Build çıktısı:

```text
frontend/dist/
```

klasörüne oluşturulur.

---

# Testler

Backend testleri pytest ile çalıştırılabilir.

Proje kök dizininden:

```powershell
python -m pytest -q
```

Mevcut test yapısı:

```text
Unit Tests
Integration Tests
```

Test edilen temel alanlar:

```text
System metric parsing
Ping
SSH
SSH system commands
Monitoring service
```

Başarılı mevcut test sonucu:

```text
5 passed
```

---

# API Yapısı

Ana API grupları:

```text
/api/v1/devices
/api/v1/devices/{id}/ssh-credentials
/api/v1/alerts
/api/v1/dashboard
/api/v1/topology/links
```

Swagger üzerinden tüm endpoint'ler incelenebilir:

```text
http://127.0.0.1:8000/docs
```

---

# Veritabanı Yapısı

Ana tablolar:

```text
devices
device_credentials
metrics
alerts
device_links
```

İlişkisel yapı:

```text
Device
 ├── Metrics
 ├── Alerts
 ├── SSH Credential
 └── Device Links
```

Database migration yönetimi Alembic ile yapılmaktadır.

Detaylı database dokümantasyonu:

```text
docs/database.md
```

---

# Güvenlik

Proje içerisinde credential güvenliği için Fernet tabanlı şifreleme kullanılmaktadır.

Şifre akışı:

```text
Plain Password
      ↓
encrypt_secret()
      ↓
Encrypted Value
      ↓
PostgreSQL
```

Monitoring sırasında:

```text
Encrypted Value
      ↓
decrypt_secret()
      ↓
SSH Connection
```

Ayrıca:

- credential password değerleri response modelinden çıkarılmıştır,
- secret değerleri `.env` üzerinden yönetilir,
- monitoring kullanıcılarının yetkilerinin sınırlandırılması önerilir,
- production ortamında uygun authentication/authorization uygulanmalıdır,
- gerçek ağ üzerinde monitoring başlamadan önce kurum izni alınmalıdır.

---

# Async ve Concurrency

Backend asynchronous yapıyı destekleyecek şekilde tasarlanmıştır.

Ana alanlar:

```text
FastAPI
SQLAlchemy AsyncSession
AsyncIOScheduler
asyncio
asyncio.to_thread
Semaphore
```

SSH gibi blocking işlemler `asyncio.to_thread` ile event loop'tan ayrıştırılır.

Aynı anda kontrol edilen cihaz sayısı semaphore ile sınırlandırılır.

Örnek:

```text
MAX_CONCURRENT_DEVICES=20
```

Bu değer kurum ortamının kapasitesine ve monitoring ihtiyacına göre ayarlanabilir.

---

# Dokümantasyon

Proje içerisinde:

```text
docs/
├── architecture.md
├── database.md
├── api.md
├── demo-scenario.md
└── institution-permission-checklist.md
```

dosyaları bulunmaktadır.

## Architecture

Sistemin genel mimarisini ve katmanlarını açıklar.

```text
docs/architecture.md
```

## Database

Database tablolarını, ilişkileri, constraint'leri ve migration yapısını açıklar.

```text
docs/database.md
```

## API

REST API endpoint'lerini ve kullanım yaklaşımını açıklar.

```text
docs/api.md
```

## Demo Scenario

Simulator kullanılarak uçtan uca test senaryosunu açıklar.

```text
docs/demo-scenario.md
```

## Institution Permission Checklist

Gerçek kurum ağına geçmeden önce kontrol edilmesi gereken erişim, yetki ve operasyon maddelerini içerir.

```text
docs/institution-permission-checklist.md
```

---

# Demo Akışı

Projeyi hızlı şekilde test etmek için önerilen akış:

```text
1. PostgreSQL'i hazırla
        ↓
2. .env oluştur
        ↓
3. alembic upgrade head
        ↓
4. Docker simulatorü başlat
        ↓
5. Backend'i başlat
        ↓
6. test-device oluştur
        ↓
7. SSH credential tanımla
        ↓
8. Monitoring çalıştır
        ↓
9. Metrics kontrol et
        ↓
10. Alerts kontrol et
        ↓
11. Topology bağlantısı oluştur
        ↓
12. Frontend'i başlat
        ↓
13. Dashboard'ı aç
```

---

# Manuel Kontrol

Backend:

```powershell
uvicorn app.main:app --reload --app-dir backend
```

Frontend:

```powershell
cd frontend
npm.cmd run dev
```

Simulator:

```powershell
docker compose up -d
```

Test:

```powershell
python -m pytest -q
```

Migration:

```powershell
cd backend
alembic upgrade head
alembic current
```

---

# Production Öncesi

Bu proje geliştirme/test ortamından gerçek kurum ağına geçirilecekse öncelikle:

```text
Kurum onayı
Cihaz envanteri
Network erişimi
SSH erişimi
Monitoring kullanıcıları
Credential güvenliği
Database güvenliği
Alert threshold'ları
Monitoring yoğunluğu
Backup
Loglama
Operasyon sorumluluğu
```

kontrol edilmelidir.

Gerçek ağ cihazlarının izlenmesi kurumun yetkilendirme ve bilgi güvenliği süreçlerine uygun şekilde yapılmalıdır.

Detaylı checklist:

```text
docs/institution-permission-checklist.md
```

---

# Proje Durumu

Mevcut proje kapsamında:

```text
Backend
  ✓ FastAPI
  ✓ PostgreSQL
  ✓ SQLAlchemy
  ✓ Alembic
  ✓ Device management
  ✓ SSH credentials
  ✓ Credential encryption
  ✓ Ping monitoring
  ✓ SSH monitoring
  ✓ System metrics
  ✓ Alerts
  ✓ Scheduler
  ✓ Topology API
  ✓ Device links
  ✓ Pytest tests

Frontend
  ✓ React
  ✓ TypeScript
  ✓ Dashboard
  ✓ Device list
  ✓ Device detail
  ✓ Metrics
  ✓ Alerts
  ✓ Topology
  ✓ React Flow
  ✓ Charts

Infrastructure
  ✓ Docker simulator
  ✓ SSH test device

Documentation
  ✓ Architecture
  ✓ Database
  ✓ API
  ✓ Demo scenario
  ✓ Institution permission checklist
```

---

# Geliştirme Felsefesi

Proje aşağıdaki prensipler dikkate alınarak geliştirilmiştir:

```text
Modülerlik
Katmanlı Mimari
Separation of Concerns
Async Programming
Repository Pattern
Service Layer
ORM
Database Migration
Input Validation
Credential Security
Testability
Scalability
Maintainability
```

Amaç yalnızca çalışan bir monitoring uygulaması oluşturmak değil, aynı zamanda gerçek bir backend/full-stack proje yapısına mümkün olduğunca yakın bir mimari ortaya koymaktır.

---

# Lisans

Bu proje `LICENSE` dosyasında belirtilen lisans koşulları kapsamında dağıtılmaktadır.
