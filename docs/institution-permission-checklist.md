# Network Monitoring Dashboard — Institution Permission Checklist

## 1. Amaç

Bu doküman, Network Monitoring Dashboard'ın gerçek bir kurum, üniversite veya şirket ağı üzerinde kullanılmaya başlanmasından önce kontrol edilmesi gereken erişim, yetki, güvenlik ve operasyon maddelerini düzenler.

Bu checklist, projenin mevcut teknik yapısını esas alır:

```text
Ping
SSH
CPU / RAM / Disk / Uptime
Metrics
Alerts
Topology
PostgreSQL
FastAPI
React
```

> Bu belge teknik bir hazırlık/checklist dokümanıdır. Kurumun kendi bilgi işlem, bilgi güvenliği, ağ ve yetkilendirme prosedürlerinin yerine geçmez.

---

# 2. Kurum Onayı

Gerçek ağ cihazları üzerinde monitoring başlatılmadan önce kurumun ilgili birimlerinden onay alınmalıdır.

| Kontrol | Durum |
|---|---|
| Monitoring yapılacak ağ/sistemler belirlendi | ☐ |
| Sistem sahibi / sorumlu birim belirlendi | ☐ |
| Monitoring amacı açıklandı | ☐ |
| İzlenecek cihaz listesi onaylandı | ☐ |
| İzleme yapılacak IP aralıkları onaylandı | ☐ |
| Monitoring çalışma saatleri belir belirlendi | ☐ |
| Gerekli kurum içi izinler alındı | ☐ |
| Değişiklik yönetimi süreci kontrol edildi | ☐ |

---

# 3. İzlenecek Cihazların Belirlenmesi

Monitoring'e dahil edilecek cihazlar önceden envanter şeklinde belirlenmelidir.

Her cihaz için:

```text
Hostname
IP address
Device type
Location
Monitoring owner
SSH availability
```

bilgileri belirlenmelidir.

| Kontrol | Durum |
|---|---|
| Cihaz envanteri oluşturuldu | ☐ |
| Hostname bilgileri doğrulandı | ☐ |
| IP adresleri doğrulandı | ☐ |
| Cihaz tipleri belirlendi | ☐ |
| Cihaz konumları belirlendi | ☐ |
| İzlenecek ve izlenmeyecek cihazlar ayrıldı | ☐ |

---

# 4. Network Erişimi

Monitoring sunucusunun izlenecek cihazlara erişebilmesi gerekir.

## Ping

Proje monitoring akışında cihaz erişilebilirliği için ping kontrolü kullanılmaktadır.

Kontrol edilmesi gerekenler:

```text
Monitoring server
      ↓
Target device
      ↓
ICMP reachability
```

| Kontrol | Durum |
|---|---|
| ICMP erişimi kurum politikası kapsamında izinli | ☐ |
| Monitoring sunucusundan hedef cihazlara ping erişimi var | ☐ |
| Gerekli firewall kuralları kontrol edildi | ☐ |
| Ağ segmentleri arasındaki erişim kontrol edildi | ☐ |

---

# 5. SSH Erişimi

Sistem metrikleri SSH üzerinden toplandığı için erişim ayrıca kontrol edilmelidir.

Mevcut proje yapısında cihaz bazlı credential kullanılır.

Temel yapı:

```text
Monitoring Server
       ↓
SSH
       ↓
Target Device
       ↓
/proc/stat
free -m
df -k /
/proc/uptime
```

| Kontrol | Durum |
|---|---|
| SSH erişiminin kullanımına kurum tarafından izin verildi | ☐ |
| Hedef cihazlarda SSH erişimi mevcut | ☐ |
| SSH portu doğrulandı | ☐ |
| Firewall üzerinden SSH erişimi kontrol edildi | ☐ |
| Monitoring sunucusunun kaynak IP'si tanımlandı | ☐ |
| Gereksiz ağlardan SSH erişimi açılmadı | ☐ |
| SSH kullanıcı hesabı kurum tarafından tanımlandı | ☐ |

---

# 6. Monitoring Kullanıcısı

SSH için mümkün olduğunca monitoring amacıyla ayrılmış bir kullanıcı hesabı kullanılmalıdır.

Projedeki simulator örneğinde:

```text
username: monitor
```

kullanılmaktadır.

Gerçek kurum ortamında simulator credential'ları kullanılmamalıdır.

Kontroller:

| Kontrol | Durum |
|---|---|
| Monitoring için ayrı kullanıcı hesabı oluşturuldu | ☐ |
| Kullanıcının yetkileri kurum politikasına göre sınırlandı | ☐ |
| Gereksiz yönetici/root yetkileri verilmedi | ☐ |
| Hesabın sahibi ve sorumlusu belirlendi | ☐ |
| Hesabın parola değiştirme/rotasyon politikası belirlendi | ☐ |
| Hesap kullanım amacı dokümante edildi | ☐ |

---

# 7. SSH Komutlarının Kontrolü

Mevcut monitoring sistemi Linux tabanlı cihazlardan aşağıdaki komutların çıktılarını kullanmaktadır:

```text
cat /proc/stat | head -n 1
free -m
df -k /
cat /proc/uptime
```

Gerçek cihazlara geçmeden önce bu komutların kurum cihazlarında desteklendiği doğrulanmalıdır.

| Kontrol | Durum |
|---|---|
| `/proc/stat` erişimi uygun | ☐ |
| `free -m` mevcut | ☐ |
| `df -k /` mevcut | ☐ |
| `/proc/uptime` erişimi uygun | ☐ |
| Komutların çıktıları beklenen formatta | ☐ |
| Özel cihaz işletim sistemi farklılıkları kontrol edildi | ☐ |

---

# 8. Credential Güvenliği

Projede SSH password değerleri şifrelenmiş olarak saklanmaktadır.

Temel akış:

```text
Password
   ↓
encrypt_secret()
   ↓
Fernet encrypted value
   ↓
PostgreSQL
```

Monitoring sırasında:

```text
Encrypted value
      ↓
decrypt_secret()
      ↓
SSH connection
```

Kontroller:

| Kontrol | Durum |
|---|---|
| `CREDENTIAL_ENCRYPTION_KEY` güvenli şekilde oluşturuldu | ☐ |
| Encryption key sadece yetkili ortamda saklanıyor | ☐ |
| Gerçek `.env` repository'ye eklenmiyor | ☐ |
| `.env.example` içerisinde gerçek secret bulunmuyor | ☐ |
| SSH password API response'larında dönmüyor | ☐ |
| Production secret yönetimi belirlenmiş | ☐ |
| Credential erişimi yetkili kişilerle sınırlandırılmış | ☐ |

---

# 9. `.env` ve Configuration

Gerçek kurum ortamına geçerken geliştirme ortamındaki değerler doğrudan kullanılmamalıdır.

Özellikle kontrol edilmesi gereken ayarlar:

```text
DATABASE_URL
CREDENTIAL_ENCRYPTION_KEY
PING_COUNT
PING_TIMEOUT
MONITORING_INTERVAL_SECONDS
MAX_CONCURRENT_DEVICES
HIGH_LATENCY_THRESHOLD_MS
HIGH_PACKET_LOSS_THRESHOLD_PERCENT
HIGH_CPU_THRESHOLD_PERCENT
HIGH_RAM_THRESHOLD_PERCENT
HIGH_DISK_THRESHOLD_PERCENT
SSH_RETRIES
SSH_TIMEOUT
```

| Kontrol | Durum |
|---|---|
| Production database bağlantısı belirlendi | ☐ |
| Encryption key production ortamında oluşturuldu | ☐ |
| Monitoring interval kurum ihtiyacına göre belirlendi | ☐ |
| Concurrent device limiti belirlendi | ☐ |
| Alert threshold değerleri belirlendi | ☐ |
| SSH retry değeri belirlendi | ☐ |
| SSH timeout değeri belirlendi | ☐ |

---

# 10. Database Güvenliği

PostgreSQL erişimi sınırlandırılmalıdır.

| Kontrol | Durum |
|---|---|
| Database yalnızca gerekli istemcilerden erişilebilir | ☐ |
| Database kullanıcı adı/parolası güvenli şekilde yönetiliyor | ☐ |
| Production database ayrı ortamda tutuluyor | ☐ |
| Database backup politikası belirlendi | ☐ |
| Backup geri yükleme prosedürü test edildi | ☐ |
| Monitoring verilerinin saklama süresi belirlendi | ☐ |

---

# 11. API Erişimi

FastAPI backend kurum ortamında erişime açılacaksa erişim kapsamı belirlenmelidir.

Kontroller:

| Kontrol | Durum |
|---|---|
| API erişim adresi belirlendi | ☐ |
| API'ye kimlerin erişeceği belirlendi | ☐ |
| Gerekli network/firewall kuralları tanımlandı | ☐ |
| Swagger/OpenAPI erişiminin kapsamı belirlendi | ☐ |
| Production ortamında uygun authentication/authorization planlandı | ☐ |
| API'nin doğrudan internete açılmadığı doğrulandı | ☐ |

> Mevcut geliştirme yapısındaki Swagger ve CORS ayarları production güvenlik politikası olarak kabul edilmemelidir.

---

# 12. CORS

Mevcut geliştirme ortamında frontend için:

```text
http://localhost:5173
http://127.0.0.1:5173
```

origin'leri tanımlıdır.

Production ortamına geçerken frontend origin'i kurumun gerçek adresine göre belirlenmelidir.

| Kontrol | Durum |
|---|---|
| Production frontend origin'i belirlendi | ☐ |
| Gereksiz origin'ler kaldırıldı | ☐ |
| CORS izinleri minimum gerekli kapsamda tutuldu | ☐ |

---

# 13. Monitoring Yoğunluğu ve Kaynak Kullanımı

Scheduler periyodik olarak aktif cihazları kontrol eder.

Projede aynı anda izlenebilecek cihaz sayısı semaphore ile sınırlandırılmaktadır.

Kontrol edilmesi gerekenler:

```text
Monitoring interval
Concurrent devices
Ping count
Ping timeout
SSH timeout
SSH retries
```

| Kontrol | Durum |
|---|---|
| Toplam cihaz sayısı belirlendi | ☐ |
| Monitoring interval belirlendi | ☐ |
| Eşzamanlı monitoring limiti test edildi | ☐ |
| Monitoring sunucusu CPU kullanımı gözlemlendi | ☐ |
| Monitoring sunucusu RAM kullanımı gözlemlendi | ☐ |
| Database yükü gözlemlendi | ☐ |

---

# 14. Alert Politikası

Projede kullanılan temel alarm türleri:

```text
Offline
HighLatency
HighPacketLoss
HighCPU
HighRAM
HighDisk
```

Alarm eşikleri kurumun operasyonel ihtiyacına göre belirlenmelidir.

| Alarm | Threshold Belirlendi | Test Edildi |
|---|---|---|
| Offline | ☐ | ☐ |
| HighLatency | ☐ | ☐ |
| HighPacketLoss | ☐ | ☐ |
| HighCPU | ☐ | ☐ |
| HighRAM | ☐ | ☐ |
| HighDisk | ☐ | ☐ |

---

# 15. Alert Bildirimleri

Mevcut projede alarm kayıtları backend ve frontend üzerinde görüntülenmektedir.

Gerçek kurum kullanımına geçmeden önce bildirim yöntemi ayrıca belirlenmelidir.

Örneğin kurumun kendi sistemlerine göre:

```text
Dashboard
E-mail
Ticket system
Messaging system
SIEM / monitoring platform
```

gibi kanallar değerlendirilebilir.

| Kontrol | Durum |
|---|---|
| Alarmın görüleceği ekran belirlendi | ☐ |
| Alarm sorumlusu belirlendi | ☐ |
| Alarm escalation süreci belirlendi | ☐ |
| Alarm çözüm sorumlusu belirlendi | ☐ |

---

# 16. Topology Verileri

Topology özelliğinde:

```text
Device
+
DeviceLink
```

verileri kullanılır.

Gerçek kurum topolojisine geçmeden önce bağlantı bilgilerinin doğruluğu kontrol edilmelidir.

| Kontrol | Durum |
|---|---|
| Cihaz listesi doğrulandı | ☐ |
| Kaynak/hedef cihazlar doğrulandı | ☐ |
| Link type bilgileri doğrulandı | ☐ |
| Link status bilgileri doğrulandı | ☐ |
| Gerçek ağ topolojisiyle karşılaştırma yapıldı | ☐ |

---

# 17. Veri Saklama

Metrics zaman içinde birikmektedir.

Bu nedenle kurum ortamına geçerken veri saklama politikası oluşturulmalıdır.

Örnek karar alanları:

```text
Metrics retention
Alert retention
Log retention
Database backup retention
```

| Kontrol | Durum |
|---|---|
| Metrics saklama süresi belirlendi | ☐ |
| Alert saklama süresi belirlendi | ☐ |
| Log saklama süresi belirlendi | ☐ |
| Disk büyümesi hesaplandı | ☐ |
| Eski veri temizleme politikası belirlendi | ☐ |

---

# 18. Loglama

Backend merkezi logger kullanmaktadır.

Kontrol edilmesi gerekenler:

| Kontrol | Durum |
|---|---|
| Monitoring hataları loglanıyor | ☐ |
| SSH bağlantı hataları loglanıyor | ☐ |
| Scheduler hataları loglanıyor | ☐ |
| Logların saklanacağı yer belirlendi | ☐ |
| Log erişim yetkileri belirlendi | ☐ |
| Sensitive credential değerlerinin loglara düşmediği kontrol edildi | ☐ |

---

# 19. Test Ortamından Production'a Geçiş

Mevcut geliştirme ortamında Docker simulator kullanılmaktadır:

```text
simulator/
└── fake-device-agent/
```

Bu simulator yalnızca test/development amacıyla kullanılmalıdır.

| Kontrol | Durum |
|---|---|
| Simulator ile gerçek cihazlar ayrıldı | ☐ |
| Test credential'ları production'dan ayrıldı | ☐ |
| Test IP'leri production cihaz listesine alınmadı | ☐ |
| Production cihaz listesi yeniden doğrulandı | ☐ |

---

# 20. Backup ve Recovery

Monitoring sistemi için en azından aşağıdaki verilerin yedeklenme yaklaşımı belirlenmelidir:

```text
PostgreSQL database
Application configuration
Alembic migration files
```

Credential encryption key'in kurtarma prosedürü ayrıca belirlenmelidir.

| Kontrol | Durum |
|---|---|
| Database backup alınıyor | ☐ |
| Backup restore testi yapıldı | ☐ |
| Migration dosyaları source control altında | ☐ |
| Encryption key recovery prosedürü belirlendi | ☐ |
| Recovery sorumlusu belirlendi | ☐ |

---

# 21. Deployment Öncesi Son Kontrol

Production'a geçmeden önce:

```text
1. Kurum onayı
2. Cihaz listesi
3. Network erişimi
4. SSH erişimi
5. Monitoring kullanıcıları
6. Credential güvenliği
7. Database
8. Threshold'lar
9. Scheduler
10. Backup
11. Loglama
12. Alert sorumluluğu
```

kontrol edilmelidir.

Teknik testler:

```powershell
python -m pytest -q
```

Beklenen mevcut proje sonucu:

```text
5 passed
```

Frontend production build:

```powershell
npm.cmd run build
```

Alembic:

```powershell
alembic current
```

Beklenen mevcut migration head:

```text
093c6928c2f7 (head)
```

---

# 22. Onay Kaydı

Gerçek kurum ortamına geçiş için aşağıdaki bilgilerin kurum tarafından ayrıca doldurulması önerilir.

```text
Kurum / Birim:
Proje Sorumlusu:
Bilgi İşlem Sorumlusu:
Ağ Sorumlusu:
Bilgi Güvenliği Sorumlusu:
Onay Tarihi:
Onay / Talep Numarası:
Monitoring Başlangıç Tarihi:
```

---

# 23. Özet

Gerçek cihaz monitoring'i başlatılmadan önce şu zincirin tamamı doğrulanmalıdır:

```text
                    Kurum Onayı
                         ↓
                  Cihaz Envanteri
                         ↓
                Network Erişimi
                         ↓
                    SSH Erişimi
                         ↓
                 Monitoring User
                         ↓
                Credential Security
                         ↓
                  FastAPI / DB
                         ↓
                   Scheduler
                         ↓
               Monitoring + Alerts
                         ↓
                  Frontend Dashboard
                         ↓
                    Operations
```

En kritik prensip:

```text
İzin → Erişim → Güvenlik → Test → Monitoring → Operasyon
```

şeklinde ilerlemek ve geliştirme ortamındaki simulator/credential bilgilerinin gerçek kurum ortamına taşınmamasını sağlamaktır.
