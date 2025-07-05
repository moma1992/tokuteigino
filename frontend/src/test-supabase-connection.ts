import { createClient } from '@supabase/supabase-js';

// Test script to verify Supabase connection
async function testSupabaseConnection() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test 1: Check connection
    console.log('\n1. Testing connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);

    if (healthError && healthError.code !== 'PGRST204') {
      console.log('⚠️  Connection test returned error (this is normal if table does not exist):', healthError.message);
    } else {
      console.log('✅ Connection successful');
    }

    // Test 2: Check auth configuration
    console.log('\n2. Testing auth configuration...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('ℹ️  No authenticated user (expected for anon key)');
    } else if (user) {
      console.log('✅ Authenticated user found:', user.email);
    }

    // Test 3: Check if profiles table exists
    console.log('\n3. Checking profiles table...');
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
      console.log('   You may need to run the migration first');
    } else {
      console.log('✅ Profiles table exists');
    }

    // Test 4: Check if teacher_students table exists
    console.log('\n4. Checking teacher_students table...');
    const { error: teacherStudentsError } = await supabase
      .from('teacher_students')
      .select('count')
      .limit(1);

    if (teacherStudentsError) {
      console.error('❌ Teacher_students table error:', teacherStudentsError.message);
      console.log('   You may need to run the migration first');
    } else {
      console.log('✅ Teacher_students table exists');
    }

    console.log('\n✅ Connection test completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testSupabaseConnection();