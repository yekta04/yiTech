# Emlak Konut Mobil Uygulaması

Modern bir konut sitesi yönetim uygulaması. React Native ve Expo ile geliştirilmiştir.

## 🚀 Özellikler

- 🏠 **Dashboard**: Kullanıcı dostu ana ekran
- 🗺️ **Site Haritası**: İnteraktif site haritası
- 🚗 **Otopark Yönetimi**: Otopark durumu ve araç bulma
- 📅 **Rezervasyon Sistemi**: Ortak alan rezervasyonları
- 🚨 **Acil Durum Bildirimi**: Hızlı güvenlik bildirimi
- 🔐 **Güvenli Giriş**: Supabase Auth entegrasyonu

## 📋 Gereksinimler

- Node.js 18+
- npm veya yarn
- Expo CLI
- Supabase hesabı

## 🛠️ Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/[kullanici-adi]/emlak-konut-proje.git
cd emlak-konut-proje
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Supabase yapılandırması:
   - `src/config/supabase.ts` dosyasını açın
   - `YOUR_SUPABASE_URL` ve `YOUR_SUPABASE_ANON_KEY` değerlerini kendi Supabase bilgilerinizle değiştirin

4. Uygulamayı başlatın:
```bash
npx expo start
```

## 📱 Kullanılan Teknolojiler

- **React Native** - Mobil uygulama framework'ü
- **Expo** - Geliştirme platformu
- **TypeScript** - Tip güvenliği
- **Supabase** - Backend ve veritabanı
- **React Navigation** - Navigasyon yönetimi
- **React Native Maps** - Harita entegrasyonu

## 📦 Paketler

- `@supabase/supabase-js` - Supabase client
- `@react-navigation/native` - Navigasyon
- `@react-navigation/bottom-tabs` - Tab navigasyon
- `expo-notifications` - Bildirimler
- `expo-location` - Konum servisleri
- `react-native-maps` - Harita görünümü
- `react-native-qrcode-svg` - QR kod oluşturma
- `@react-native-async-storage/async-storage` - Yerel depolama

## 🗄️ Veritabanı Kurulumu

Supabase SQL Editor'da aşağıdaki tabloları oluşturun:
- `profiles` - Kullanıcı profilleri
- `parking_spots` - Otopark alanları
- `emergency_alerts` - Acil durum bildirimleri
- `reservations` - Rezervasyonlar

SQL sorgusu için proje dokümantasyonuna bakın.

## 📝 Lisans

MIT

## 👨‍💻 Geliştirici

[Adınız]
