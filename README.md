# 🏢 Emlak Konut - Site Yönetim Uygulaması

Modern, kapsamlı ve rol tabanlı bir konut sitesi yönetim sistemi. React Native, Expo ve Supabase ile geliştirilmiş, profesyonel bir mobil uygulama.

---

## 📱 Genel Bakış

**Emlak Konut**, site sakinleri, yöneticiler, güvenlik görevlileri ve temizlik personeli için özel olarak tasarlanmış, tam özellikli bir site yönetim platformudur. Uygulama, rol tabanlı erişim kontrolü ile her kullanıcı tipine özel arayüzler sunar.

### 🎯 Temel Özellikler

- ✅ **Rol Tabanlı Erişim Kontrolü** - 4 farklı kullanıcı rolü (Sakin, Admin, Güvenlik, Temizlik)
- ✅ **Gerçek Zamanlı Bildirimler** - Supabase Realtime ile anlık güncellemeler
- ✅ **QR Kod Tabanlı Misafir Yönetimi** - Güvenli giriş-çıkış kontrolü
- ✅ **Canlı Konum Takibi** - Temizlik personeli için GPS tabanlı takip
- ✅ **Akıllı Dashboard'lar** - Her rol için özelleştirilmiş kontrol panelleri
- ✅ **Mali Yönetim** - Aidat, demirbaş ve ceza takibi
- ✅ **Otopark Yönetimi** - Araç bulma ve otopark durumu
- ✅ **Rezervasyon Sistemi** - Ortak alan rezervasyonları
- ✅ **Acil Durum Sistemi** - Hızlı güvenlik bildirimi
- ✅ **Pazar Yeri** - Site içi alım-satım platformu
- ✅ **Etkinlik Yönetimi** - Site etkinlikleri ve duyurular

---

## 🎨 Kullanıcı Rolleri ve Özellikleri

### 👤 Sakin (Resident)

**Erişim:** Standart site sakini hesabı

**Özellikler:**
- 🏠 Kişisel dashboard ile site durumu görüntüleme
- 🗑️ Çöp toplama hizmeti talebi oluşturma
- 📍 Harita üzerinde temizlik personeli takibi
- 👥 Misafir oluşturma ve QR kod paylaşımı
- 🚗 Otopark durumu ve araç bulma
- 📅 Ortak alan rezervasyonu yapma
- 💰 Mali durum ve aidat takibi
- 🛒 Pazar yerinde ilan verme/görüntüleme
- 📢 Duyuru ve etkinlikleri görüntüleme
- 🆘 Acil durum bildirimi gönderme

**Navigasyon Sekmeleri:**
- Ana Sayfa
- Hizmetler
- Misafirler
- Otopark

---

### 👑 Yönetici (Admin)

**Erişim:** Tam yönetim yetkisi

**Özellikler:**
- 📊 Kapsamlı istatistik dashboard'u
  - Toplam kullanıcı sayısı
  - Aktif sorun/talep sayısı
  - Günlük misafir sayısı
- 👥 Kullanıcı yönetimi
  - Tüm kullanıcıları listeleme ve arama
  - Kullanıcı bilgilerini düzenleme (Ad, Telefon, Blok, Daire)
  - Rol atama ve değiştirme
- 🎫 Destek talepleri yönetimi
  - Talepleri görüntüleme ve durum güncelleme
  - Kategori bazlı filtreleme
- 💳 Mali işlemler yönetimi
- 📢 Duyuru ve etkinlik oluşturma
- 🔐 Tüm verilere tam erişim

**Navigasyon Sekmeleri:**
- Yönetim Paneli
- Kullanıcılar
- Misafirler

---

### 🛡️ Güvenlik (Security)

**Erişim:** Giriş-çıkış kontrol yetkisi

**Özellikler:**
- 📷 QR kod tarayıcı
  - Expo Camera ile gerçek zamanlı tarama
  - Otomatik misafir doğrulama
- ⌨️ Manuel kod girişi
  - Alternatif giriş yöntemi
- 👥 Misafir listesi
  - Bugün beklenen misafirler
  - Giriş yapmış misafirler
  - Durum güncelleme (Bekleniyor/Geldi/Ayrıldı)
- ✅ Giriş onay/red sistemi
  - Yeşil ekran: Giriş onaylandı
  - Kırmızı ekran: Erişim reddedildi
- 🚨 Güvenlik talepleri yönetimi
- 📊 Günlük istatistikler

**Navigasyon Sekmeleri:**
- QR Tara
- Misafirler

---

### 🧹 Temizlik Personeli (Cleaner)

**Erişim:** Görev ve hizmet yönetimi

**Özellikler:**
- 🔄 Mesai durumu kontrolü
  - On Duty / Off Duty switch
  - Otomatik konum paylaşımı (10 saniyede bir)
- 📋 Görev listesi
  - Bekleyen çöp toplama talepleri
  - Tamir/bakım talepleri
  - Görev detayları (Sakin adı, blok, daire)
- ✅ Görev tamamlama
  - Tek tıkla görev kapatma
  - Otomatik durum güncelleme
- 📍 GPS tabanlı konum takibi
  - Gerçek zamanlı konum paylaşımı
  - Harita üzerinde görünürlük
- 🧼 Özel temizlik talepleri
  - Kategori bazlı talepler
  - Durum güncelleme (Başla/Bitir)
- 📊 İstatistikler
  - Toplam görev sayısı
  - Tamamlanan görevler

**Navigasyon Sekmeleri:**
- Görevler

---

## 🛠️ Teknoloji Stack'i

### Frontend
- **React Native** `0.81.5` - Cross-platform mobil framework
- **Expo** `~54.0.25` - Geliştirme ve build platformu
- **TypeScript** `^5.9.3` - Tip güvenliği ve kod kalitesi
- **React Navigation** `^7.1.20` - Navigasyon yönetimi
  - Bottom Tabs Navigator - Rol bazlı tab yapısı
  - Custom Tab Bar - Animasyonlu, özel tasarım

### Backend & Database
- **Supabase** `^2.83.0` - Backend as a Service
  - PostgreSQL veritabanı
  - Row Level Security (RLS)
  - Realtime subscriptions
  - Authentication & Authorization

### UI/UX Kütüphaneleri
- **Expo Linear Gradient** `~15.0.7` - Gradient efektleri
- **React Native Safe Area Context** `~5.6.0` - Güvenli alan yönetimi
- **React Native SVG** `^15.15.0` - SVG desteği
- **React Native QRCode SVG** `^6.3.20` - QR kod oluşturma

### Konum & Harita
- **React Native Maps** `1.20.1` - Harita görünümü
- **Expo Location** `~19.0.7` - GPS ve konum servisleri

### Kamera & Medya
- **Expo Camera** `^17.0.9` - QR kod tarama
- **Expo Sharing** `^14.0.7` - Dosya paylaşımı

### Diğer
- **Expo Notifications** `~0.32.13` - Push bildirimleri
- **Expo Device** `~8.0.9` - Cihaz bilgileri
- **Expo Speech** `~14.0.7` - Sesli bildirimler
- **AsyncStorage** `2.2.0` - Yerel veri saklama
- **React Native URL Polyfill** `^3.0.0` - URL desteği

---

## 📦 Kurulum

### Gereksinimler

- **Node.js** 18.x veya üzeri
- **npm** veya **yarn**
- **Expo CLI** (opsiyonel, npx ile kullanılabilir)
- **Supabase** hesabı
- **iOS Simulator** (Mac) veya **Android Emulator**

### Adım 1: Projeyi Klonlayın

```bash
git clone https://github.com/yekta04/yiTech.git
cd yiTech
```

### Adım 2: Bağımlılıkları Yükleyin

```bash
npm install
```

### Adım 3: Supabase Yapılandırması

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. `src/config/supabase.ts` dosyasını açın
4. Supabase URL ve Anon Key'i güncelleyin

### Adım 4: Veritabanı Kurulumu

1. Supabase Dashboard → SQL Editor'a gidin
2. `FINAL_DATABASE_SETUP.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'a yapıştırın ve çalıştırın

**Oluşturulan Tablolar:**
- `profiles` - Kullanıcı profilleri ve roller
- `parking_spots` - Otopark alanları
- `emergency_alerts` - Acil durum bildirimleri
- `reservations` - Ortak alan rezervasyonları
- `announcements` - Duyurular
- `service_requests` - Hizmet talepleri
- `transactions` - Mali işlemler
- `guests` - Misafir kayıtları
- `marketplace_items` - Pazar yeri ilanları
- `site_events` - Etkinlikler
- `service_logs` - Çöp toplama/tamir kayıtları
- `staff_locations` - Personel konum takibi

### Adım 5: Uygulamayı Başlatın

```bash
npx expo start
```

---

## 🔐 Test Kullanıcıları

| Rol | Email | Şifre | Açıklama |
|-----|-------|-------|----------|
| 👑 **Admin** | `admin@site.com` | `123456` | Tam yönetim yetkisi |
| 🛡️ **Güvenlik** | `security@site.com` | `123456` | QR tarama ve misafir kontrolü |
| 🧹 **Temizlik** | `cleaner@site.com` | `123456` | Görev yönetimi ve konum paylaşımı |
| 👤 **Sakin** | `resident@site.com` | `123456` | Standart kullanıcı özellikleri |

---

## 🗄️ Veritabanı Mimarisi

### Row Level Security (RLS) Politikaları

**Profiles (Profiller)**
- Herkes profilleri okuyabilir
- Kullanıcılar kendi profillerini güncelleyebilir
- Admin tüm profilleri yönetebilir

**Guests (Misafirler)**
- Kullanıcılar kendi misafirlerini yönetebilir
- Güvenlik ve Admin tüm misafirleri görebilir
- Güvenlik misafir durumunu güncelleyebilir

**Service Logs (Hizmet Kayıtları)**
- Sakinler kendi taleplerini oluşturabilir
- Temizlik personeli tüm talepleri görebilir ve güncelleyebilir

**Staff Locations (Personel Konumları)**
- Herkes personel konumlarını görebilir
- Sadece personel kendi konumunu güncelleyebilir

### Realtime Subscriptions

Gerçek zamanlı güncellemeler için yapılandırılmış tablolar:
- `service_logs` - Çöp toplama talepleri
- `staff_locations` - Personel konumları
- `guests` - Misafir durumları
- `emergency_alerts` - Acil durum bildirimleri

---

## 🎨 Tasarım Sistemi

### Renk Paleti

Uygulama genelinde tutarlı bir **Turkuaz Mavi** teması kullanılmaktadır:

```typescript
const COLORS = {
  primary: '#06B6D4',        // Turkuaz Mavi (Ana renk)
  primaryDark: '#0891B2',    // Koyu Turkuaz
  darkText: '#1F2937',       // Koyu metin
  lightText: '#9CA3AF',      // Açık metin
  background: '#F8FDFF',     // Arkaplan
  inputBg: '#F0F9FF',        // Input arkaplanı
  white: '#FFFFFF',          // Beyaz
  shadow: '#06B6D4',         // Gölge rengi
  danger: '#EF4444',         // Hata/Silme
  success: '#6BCB77',        // Başarı
  warning: '#FFD93D',        // Uyarı
};
```

### Tipografi

- **Header**: 26-28px, Bold (800)
- **Title**: 18-20px, Bold (700)
- **Body**: 14-16px, Medium (500-600)
- **Caption**: 12-13px, Regular (400-500)

### Bileşenler

- **Gradient Buttons**: Linear gradient ile turkuaz tonları
- **Cards**: Rounded corners (20-24px), subtle shadows
- **Icons**: Material Community Icons
- **Animations**: React Native Animated API ile smooth transitions

---

## 📂 Proje Yapısı

```
emlak-konut-proje/
├── assets/                      # Statik dosyalar
│   └── logo.jpg                 # Uygulama logosu
├── src/
│   ├── components/              # Paylaşılan bileşenler
│   │   ├── Button.tsx
│   │   ├── Loading.tsx
│   │   └── SafeContainer.tsx
│   ├── config/                  # Yapılandırma dosyaları
│   │   ├── supabase.ts         # Supabase client
│   │   └── theme.ts            # Tema ayarları
│   ├── features/               # Özellik bazlı modüller
│   │   ├── admin/              # Yönetici özellikleri
│   │   ├── auth/               # Kimlik doğrulama
│   │   ├── emergency/          # Acil durum
│   │   ├── home/               # Ana sayfa özellikleri
│   │   ├── map/                # Harita
│   │   ├── parking/            # Otopark
│   │   ├── reservation/        # Rezervasyon
│   │   ├── security/           # Güvenlik
│   │   └── services/           # Hizmetler
│   ├── navigation/             # Navigasyon yapısı
│   │   ├── AppTabs.tsx         # Rol bazlı tab navigator
│   │   └── RootNavigator.tsx   # Ana navigator
│   ├── services/               # Servisler
│   │   ├── notificationService.ts
│   │   └── offlineSync.ts
│   └── types/                  # TypeScript tipleri
│       └── database.types.ts
├── App.tsx                     # Ana uygulama dosyası
├── app.json                    # Expo yapılandırması
├── package.json                # Bağımlılıklar
├── tsconfig.json               # TypeScript yapılandırması
├── FINAL_DATABASE_SETUP.sql    # Veritabanı kurulum scripti
└── README.md                   # Bu dosya
```

---

## 🚀 Özellik Detayları

### 1. QR Kod Tabanlı Misafir Sistemi

**Sakin Tarafı:**
- Misafir bilgileri girişi (Ad, Plaka, Tarih)
- Otomatik QR kod oluşturma
- QR kod paylaşımı (SMS, WhatsApp, Email)
- Misafir durumu takibi

**Güvenlik Tarafı:**
- Expo Camera ile QR tarama
- Manuel kod girişi alternatifi
- Otomatik doğrulama
- Giriş/Red ekranları
- Durum güncelleme (Bekleniyor → Geldi)

### 2. Gerçek Zamanlı Konum Takibi

**Temizlik Personeli:**
- On/Off duty switch
- Otomatik GPS konum paylaşımı (10 saniye aralıkla)
- Supabase'e konum kaydetme

**Sakin:**
- Harita üzerinde personel konumu görüntüleme
- Gerçek zamanlı güncelleme
- Mesafe hesaplama

### 3. Çöp Toplama Hizmeti

**İş Akışı:**
1. Sakin "Çöp Hazır" butonuna basar
2. Talep `service_logs` tablosuna kaydedilir
3. Temizlik personeli görev listesinde görür
4. Personel göreve gider
5. "Tamamla" butonu ile görev kapatılır
6. Durum otomatik güncellenir

### 4. Rol Bazlı Navigasyon

Her rol için özel tab yapısı dinamik olarak oluşturulur.

---

## 🔧 Yapılandırma

### Expo Plugins

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Misafir QR kodlarını taramak için kamera izni gereklidir."
        }
      ]
    ]
  }
}
```

### İzinler

**Android:**
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `CAMERA`
- `INTERNET`

**iOS:**
- `NSLocationWhenInUseUsageDescription`
- `NSCameraUsageDescription`

---

## 📊 Performans Optimizasyonları

- **Lazy Loading**: Ekranlar ihtiyaç duyulduğunda yüklenir
- **Memoization**: React.memo ve useMemo kullanımı
- **FlatList Optimization**: windowSize, maxToRenderPerBatch ayarları
- **Realtime Throttling**: Konum güncellemeleri 10 saniyede bir

---

## 🚢 Deployment

### Android APK Build

```bash
eas build --platform android --profile preview
```

### iOS IPA Build

```bash
eas build --platform ios --profile preview
```

---

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

**Son Güncelleme:** Kasım 2024  
**Versiyon:** 1.0.0  
**Durum:** ✅ Production Ready
