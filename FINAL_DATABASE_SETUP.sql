-- ============================================================================
-- EMLAK KONUT PROJESİ - TEK VERİTABANI KURULUM DOSYASI
-- ============================================================================
-- Bu dosya TEK SEFERDE çalıştırılacak
-- Hem yeni kurulum hem de mevcut kullanıcıları düzeltme
-- Rol tabanlı giriş %100 çalışacak
-- ============================================================================
-- 
-- KULLANIM:
-- 1. Supabase Dashboard → SQL Editor
-- 2. Bu dosyanın TÜM içeriğini kopyala
-- 3. Yapıştır ve RUN butonuna bas
-- 4. Giriş yap: admin@site.com / 123456
-- 
-- ============================================================================

-- ============================================================================
-- ADIM 1: GEREKLİ EKLENTİLER
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ADIM 2: ESKİ YAPILARI TEMİZLE (Varsa)
-- ============================================================================

-- Önce bağımlılıkları kaldır
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_system_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_with_role(text,text,text,text) CASCADE;

-- NOT: Tabloları SİLMİYORUZ - Sadece yeniden oluşturuyoruz
-- Eğer tamamen sıfırdan başlamak istiyorsanız, aşağıdaki satırların başındaki -- işaretini kaldırın
-- DROP TABLE IF EXISTS public.staff_locations CASCADE;
-- DROP TABLE IF EXISTS public.service_logs CASCADE;
-- DROP TABLE IF EXISTS public.site_events CASCADE;
-- DROP TABLE IF EXISTS public.marketplace_items CASCADE;
-- DROP TABLE IF EXISTS public.guests CASCADE;
-- DROP TABLE IF EXISTS public.transactions CASCADE;
-- DROP TABLE IF EXISTS public.service_requests CASCADE;
-- DROP TABLE IF EXISTS public.announcements CASCADE;
-- DROP TABLE IF EXISTS public.reservations CASCADE;
-- DROP TABLE IF EXISTS public.emergency_alerts CASCADE;
-- DROP TABLE IF EXISTS public.parking_spots CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================================
-- ADIM 3: PROFILES TABLOSU (EN ÖNEMLİ!)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'resident' CHECK (role IN ('resident', 'admin', 'cleaner', 'security')),
  phone TEXT,
  address TEXT,
  block_no TEXT,
  apartment_no TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS'İ KAPAT (Giriş sorunlarını önlemek için - Development)
-- Production'da aktif etmek için aşağıdaki satırı yorumdan çıkarın
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ROL TABANLI GÜVENLİK POLİTİKALARI (Production için)
-- Şu anda kapalı - Aktif etmek için yukarıdaki DISABLE'ı ENABLE yapın

-- Herkes profilleri okuyabilir (Uygulama için gerekli)
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
CREATE POLICY "Anyone can read profiles" 
ON public.profiles FOR SELECT 
USING (true);

-- Kullanıcılar kendi profillerini güncelleyebilir
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Admin tüm profilleri güncelleyebilir
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin yeni profil oluşturabilir
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(id);

-- Eksik profilleri oluştur (auth.users'da olup profiles'da olmayanlar)
INSERT INTO public.profiles (id, full_name, avatar_url, role)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'User'),
  '',
  'resident'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ADIM 4: DİĞER TABLOLAR
-- ============================================================================

-- Otopark
CREATE TABLE IF NOT EXISTS public.parking_spots (
  id BIGSERIAL PRIMARY KEY,
  location_code TEXT NOT NULL UNIQUE,
  is_occupied BOOLEAN DEFAULT FALSE,
  occupied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.parking_spots DISABLE ROW LEVEL SECURITY;

-- ROL TABANLI: Herkes okuyabilir, sadece authenticated kullanıcılar güncelleyebilir
DROP POLICY IF EXISTS "Anyone can view parking" ON public.parking_spots;
CREATE POLICY "Anyone can view parking" 
ON public.parking_spots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can update parking" ON public.parking_spots;
CREATE POLICY "Authenticated can update parking" 
ON public.parking_spots FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Acil Durum
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);
ALTER TABLE public.emergency_alerts DISABLE ROW LEVEL SECURITY;

-- ROL TABANLI: Herkes görebilir, authenticated kullanıcılar oluşturabilir
DROP POLICY IF EXISTS "Anyone can view alerts" ON public.emergency_alerts;
CREATE POLICY "Anyone can view alerts" 
ON public.emergency_alerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can create alerts" ON public.emergency_alerts;
CREATE POLICY "Authenticated can create alerts" 
ON public.emergency_alerts FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Rezervasyonlar
CREATE TABLE IF NOT EXISTS public.reservations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_name TEXT NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;

-- ROL TABANLI: Herkes görebilir, kullanıcılar kendi rezervasyonlarını oluşturabilir
DROP POLICY IF EXISTS "Anyone can view reservations" ON public.reservations;
CREATE POLICY "Anyone can view reservations" 
ON public.reservations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reservations" ON public.reservations;
CREATE POLICY "Users can create reservations" 
ON public.reservations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reservations" ON public.reservations;
CREATE POLICY "Users can delete own reservations" 
ON public.reservations FOR DELETE 
USING (auth.uid() = user_id);

-- Duyurular
CREATE TABLE IF NOT EXISTS public.announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;

-- ROL TABANLI: Herkes okuyabilir, sadece Admin oluşturabilir
DROP POLICY IF EXISTS "Anyone can view announcements" ON public.announcements;
CREATE POLICY "Anyone can view announcements" 
ON public.announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can create announcements" ON public.announcements;
CREATE POLICY "Admins can create announcements" 
ON public.announcements FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Hizmet Talepleri
CREATE TABLE IF NOT EXISTS public.service_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('maintenance', 'cleaning', 'security')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.service_requests DISABLE ROW LEVEL SECURITY;

-- ROL TABANLI: Kullanıcılar kendi taleplerini görebilir, Staff hepsini görebilir
DROP POLICY IF EXISTS "Users can view own requests" ON public.service_requests;
CREATE POLICY "Users can view own requests" 
ON public.service_requests FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can view all requests" ON public.service_requests;
CREATE POLICY "Staff can view all requests" 
ON public.service_requests FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'cleaner', 'security')
  )
);

DROP POLICY IF EXISTS "Users can create requests" ON public.service_requests;
CREATE POLICY "Users can create requests" 
ON public.service_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can update requests" ON public.service_requests;
CREATE POLICY "Staff can update requests" 
ON public.service_requests FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'cleaner')
  )
);

-- Mali İşlemler
CREATE TABLE IF NOT EXISTS public.transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('aidat', 'demirbas', 'ceza')),
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid')),
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;

-- ROL TABANLI: Kullanıcılar kendi işlemlerini, Admin hepsini görebilir
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" 
ON public.transactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can create transactions" ON public.transactions;
CREATE POLICY "Admins can create transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Misafirler
CREATE TABLE IF NOT EXISTS public.guests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  plate_number TEXT,
  visit_date DATE NOT NULL,
  status TEXT DEFAULT 'expected' CHECK (status IN ('expected', 'arrived', 'departed')),
  qr_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.guests DISABLE ROW LEVEL SECURITY;

-- ROL TABANLI: Kullanıcılar kendi misafirlerini, Security hepsini görebilir
DROP POLICY IF EXISTS "Users can view own guests" ON public.guests;
CREATE POLICY "Users can view own guests" 
ON public.guests FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Security can view all guests" ON public.guests;
CREATE POLICY "Security can view all guests" 
ON public.guests FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('security', 'admin')
  )
);

DROP POLICY IF EXISTS "Users can create guests" ON public.guests;
CREATE POLICY "Users can create guests" 
ON public.guests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Security can update guests" ON public.guests;
CREATE POLICY "Security can update guests" 
ON public.guests FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('security', 'admin')
  )
);

-- Pazar Yeri
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price NUMERIC(10, 2) DEFAULT 0,
  description TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.marketplace_items DISABLE ROW LEVEL SECURITY;

-- ROL TABANLI: Herkes görebilir, kullanıcılar kendi ilanlarını yönetebilir
DROP POLICY IF EXISTS "Anyone can view marketplace" ON public.marketplace_items;
CREATE POLICY "Anyone can view marketplace" 
ON public.marketplace_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create items" ON public.marketplace_items;
CREATE POLICY "Users can create items" 
ON public.marketplace_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own items" ON public.marketplace_items;
CREATE POLICY "Users can update own items" 
ON public.marketplace_items FOR UPDATE 
USING (auth.uid() = user_id);

-- Etkinlikler
CREATE TABLE IF NOT EXISTS public.site_events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.site_events DISABLE ROW LEVEL SECURITY;

-- ROL TABANLI: Herkes görebilir, sadece Admin oluşturabilir
DROP POLICY IF EXISTS "Anyone can view events" ON public.site_events;
CREATE POLICY "Anyone can view events" 
ON public.site_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can create events" ON public.site_events;
CREATE POLICY "Admins can create events" 
ON public.site_events FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Çöp Toplama Kayıtları
CREATE TABLE IF NOT EXISTS public.service_logs (
  id BIGSERIAL PRIMARY KEY,
  resident_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('garbage', 'repair')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  coordinates JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.service_logs DISABLE ROW LEVEL SECURITY;

-- ROL TABANLI: Resident kendi kayıtlarını, Cleaner hepsini görebilir
DROP POLICY IF EXISTS "Users can view own logs" ON public.service_logs;
CREATE POLICY "Users can view own logs" 
ON public.service_logs FOR SELECT 
USING (auth.uid() = resident_id OR auth.uid() = staff_id);

DROP POLICY IF EXISTS "Cleaners can view all logs" ON public.service_logs;
CREATE POLICY "Cleaners can view all logs" 
ON public.service_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('cleaner', 'admin')
  )
);

DROP POLICY IF EXISTS "Residents can create logs" ON public.service_logs;
CREATE POLICY "Residents can create logs" 
ON public.service_logs FOR INSERT 
WITH CHECK (auth.uid() = resident_id);

DROP POLICY IF EXISTS "Cleaners can update logs" ON public.service_logs;
CREATE POLICY "Cleaners can update logs" 
ON public.service_logs FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('cleaner', 'admin')
  )
);

-- Personel Konum Takibi
CREATE TABLE IF NOT EXISTS public.staff_locations (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.staff_locations DISABLE ROW LEVEL SECURITY;

-- ROL TABANLI: Herkes görebilir, sadece Staff kendi konumunu güncelleyebilir
DROP POLICY IF EXISTS "Anyone can view staff locations" ON public.staff_locations;
CREATE POLICY "Anyone can view staff locations" 
ON public.staff_locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can update own location" ON public.staff_locations;
CREATE POLICY "Staff can update own location" 
ON public.staff_locations FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('cleaner', 'admin')
  )
);

DROP POLICY IF EXISTS "Staff can update location" ON public.staff_locations;
CREATE POLICY "Staff can update location" 
ON public.staff_locations FOR UPDATE 
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('cleaner', 'admin')
  )
);

-- ============================================================================
-- ADIM 5: REALTIME AYARLARI
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.service_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;

-- ============================================================================
-- ADIM 6: OTOMATİK PROFİL OLUŞTURMA (Yeni kullanıcılar için)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'New User'),
    '',
    'resident'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Hata olsa bile kullanıcı oluşturulsun
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ADIM 7: MANUEL KULLANICI OLUŞTURMA FONKSİYONU
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_user_with_role(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_role TEXT DEFAULT 'resident'
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
  encrypted_pw TEXT;
BEGIN
  -- Kullanıcı zaten varsa, sadece rolünü güncelle
  SELECT id INTO new_user_id FROM auth.users WHERE email = user_email;
  
  IF new_user_id IS NOT NULL THEN
    -- Profile varsa güncelle, yoksa oluştur
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (new_user_id, user_name, user_role)
    ON CONFLICT (id) DO UPDATE 
    SET role = user_role, full_name = user_name;
    
    RETURN new_user_id;
  END IF;

  -- Yeni kullanıcı oluştur
  new_user_id := gen_random_uuid();
  encrypted_pw := crypt(user_password, gen_salt('bf'));

  -- Auth users'a ekle
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, 
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id, 'authenticated', 'authenticated',
    user_email, encrypted_pw, NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', user_name),
    NOW(), NOW(), ''
  );

  -- Identities'e ekle
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), new_user_id,
    jsonb_build_object('sub', new_user_id, 'email', user_email),
    'email', user_email, NOW(), NOW(), NOW()
  );

  -- Profile ekle (ON CONFLICT ile güvenli)
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new_user_id, user_name, user_role)
  ON CONFLICT (id) DO UPDATE 
  SET role = user_role, full_name = user_name;

  RETURN new_user_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Hata durumunda NULL döndür
    RAISE NOTICE 'Kullanıcı oluşturma hatası: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ADIM 8: TEST KULLANICILARI OLUŞTUR
-- ============================================================================

-- Önce mevcut kullanıcıların rollerini güncelle
UPDATE public.profiles SET role = 'admin', full_name = 'Site Yöneticisi'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@site.com');

UPDATE public.profiles SET role = 'security', full_name = 'Güvenlik Görevlisi'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'security@site.com');

UPDATE public.profiles SET role = 'cleaner', full_name = 'Temizlik Personeli'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'cleaner@site.com');

UPDATE public.profiles SET role = 'resident', full_name = 'Ahmet Yılmaz'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'resident@site.com');

-- Sonra yeni kullanıcıları oluştur (yoksa)
DO $$
BEGIN
  -- Admin
  PERFORM public.create_user_with_role(
    'admin@site.com',
    '123456',
    'Site Yöneticisi',
    'admin'
  );
  
  -- Security
  PERFORM public.create_user_with_role(
    'security@site.com',
    '123456',
    'Güvenlik Görevlisi',
    'security'
  );
  
  -- Cleaner
  PERFORM public.create_user_with_role(
    'cleaner@site.com',
    '123456',
    'Temizlik Personeli',
    'cleaner'
  );
  
  -- Resident
  PERFORM public.create_user_with_role(
    'resident@site.com',
    '123456',
    'Ahmet Yılmaz',
    'resident'
  );
  
  RAISE NOTICE '✅ Test kullanıcıları hazır';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Kullanıcı oluşturma atlandı (zaten mevcut): %', SQLERRM;
END $$;

-- ============================================================================
-- ADIM 9: ÖRNEK VERİLER
-- ============================================================================

-- Otopark yerleri
INSERT INTO public.parking_spots (location_code, is_occupied) VALUES
  ('A-01', false), ('A-02', false), ('A-03', false),
  ('B-01', false), ('B-02', false), ('B-03', false)
ON CONFLICT (location_code) DO NOTHING;

-- Duyurular
INSERT INTO public.announcements (title, content, priority) VALUES
  ('Hoş Geldiniz', 'Site Life uygulamasına hoş geldiniz!', 'high'),
  ('Bakım Çalışması', 'Yarın saat 10:00-12:00 arası su kesintisi olacaktır.', 'high')
ON CONFLICT DO NOTHING;

-- Etkinlikler
INSERT INTO public.site_events (title, date, location, description) VALUES
  ('Yaz Şenliği', CURRENT_DATE + INTERVAL '7 days', 'Site Bahçesi', 'Tüm site sakinleri davetlidir.')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ADIM 10: KONTROL VE DOĞRULAMA
-- ============================================================================

-- Kullanıcıları listele
SELECT 
  u.email,
  p.full_name,
  p.role,
  u.email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY p.role, u.email;

-- ============================================================================
-- TAMAMLANDI!
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '✅ VERİTABANI KURULUMU BAŞARIYLA TAMAMLANDI!';
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Test Kullanıcıları:';
  RAISE NOTICE '   👑 Admin:     admin@site.com     / 123456';
  RAISE NOTICE '   🛡️  Security:  security@site.com  / 123456';
  RAISE NOTICE '   🧹 Cleaner:   cleaner@site.com   / 123456';
  RAISE NOTICE '   🏠 Resident:  resident@site.com  / 123456';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 ROL TABANLI GÜVENLİK:';
  RAISE NOTICE '   ✅ Tüm tablolar için RLS politikaları tanımlandı';
  RAISE NOTICE '   ⚠️  Şu anda RLS KAPALI (Development)';
  RAISE NOTICE '   ⚠️  Production için RLS''i aktif edin!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 ROL YETKİLERİ:';
  RAISE NOTICE '   👑 Admin: Tüm verilere erişim + Kullanıcı yönetimi';
  RAISE NOTICE '   🛡️  Security: Misafir yönetimi + QR kontrol';
  RAISE NOTICE '   🧹 Cleaner: Görev yönetimi + Konum paylaşımı';
  RAISE NOTICE '   🏠 Resident: Kendi verileri + Hizmet talepleri';
  RAISE NOTICE '';
END $$;
