const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btbnvyatkpgaqxjnmmay.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Ym52eWF0a3BnYXF4am5tbWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MTk5OTcsImV4cCI6MjA3OTM5NTk5N30.VgiDauImPqJ-UkRVTeEzZLdWw_rk7u1SSmFBxqsQqsI'
);

async function test() {
  console.log('Testing login with admin@test.com...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@test.com',
    password: '123456',
  });
  
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ SUCCESS! User:', data.user.email);
  }
}

test();
