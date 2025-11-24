// Supabase Bağlantı ve Kullanıcı Test Scripti
// Node.js ile çalıştır: node test_supabase_connection.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://btbnvyatkpgaqxjnmmay.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Ym52eWF0a3BnYXF4am5tbWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MTk5OTcsImV4cCI6MjA3OTM5NTk5N30.VgiDauImPqJ-UkRVTeEzZLdWw_rk7u1SSmFBxqsQqsI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 

async function testConnection() {
  console.log('🔍 Supabase Bağlantı Testi Başlıyor...\n');

  // 1. Profiles tablosunu kontrol et
  console.log('1️⃣ Profiles tablosunu kontrol ediyorum...');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(5);

  if (profilesError) {
    console.error('❌ Profiles hatası:', profilesError.message);
  } else {
    console.log('✅ Profiles tablosu okundu:', profiles?.length, 'kayıt bulundu');
    if (profiles && profiles.length > 0) {
      console.log('   İlk kullanıcı:', profiles[0]);
    }
  }

  // 2. Admin kullanıcısını kontrol et
  console.log('\n2️⃣ Admin kullanıcısını arıyorum...');
  const { data: adminProfile, error: adminError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (adminError) {
    console.error('❌ Admin bulunamadı:', adminError.message);
  } else {
    console.log('✅ Admin bulundu:', adminProfile);
  }

  // 3. Giriş testi
  console.log('\n3️⃣ Admin ile giriş testi yapıyorum...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin@site.com',
    password: '123456',
  });

  if (loginError) {
    console.error('❌ Giriş hatası:', loginError.message);
    console.error('   Detay:', loginError);
  } else {
    console.log('✅ Giriş başarılı!');
    console.log('   User ID:', loginData.user?.id);
    console.log('   Email:', loginData.user?.email);
    
    // Kullanıcının profilini çek
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user?.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profil çekme hatası:', profileError.message);
    } else {
      console.log('✅ Kullanıcı profili:', userProfile);
    }
  }

  // 4. Auth kullanıcılarını listele
  console.log('\n4️⃣ Tüm auth kullanıcılarını kontrol ediyorum...');
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('❌ Kullanıcılar listelenemedi:', usersError.message);
    console.log('   (Bu normal - admin API key gerektirir)');
  } else {
    console.log('✅ Toplam kullanıcı sayısı:', users?.length);
  }

  console.log('\n✅ Test tamamlandı!');
}

testConnection().catch(console.error);
