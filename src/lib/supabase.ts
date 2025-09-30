import { createClient } from '@supabase/supabase-js';

console.log('🔍 Supabase Configuration Debug:');
console.log('Environment variables available:', {
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
  keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl = supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
const isValidKey = supabaseAnonKey && supabaseAnonKey.startsWith('eyJ') && supabaseAnonKey.length > 100;

const isConfigured = isValidUrl && isValidKey;

console.log('🔍 Validation Results:', {
  isValidUrl,
  isValidKey,
  isConfigured
});

if (!isConfigured) {
  console.warn('❌ Supabase configuration invalid:');
  if (!isValidUrl) console.warn('   - Invalid URL format or missing');
  if (!isValidKey) console.warn('   - Invalid API key format or missing');
  console.warn('   Database functionality will be disabled.');
}

let supabaseClient = null;

if (isConfigured) {
  try {
    console.log('🚀 Creating Supabase client...');
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('✅ Supabase client created successfully');
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    supabaseClient = null;
  }
}

export const supabase = supabaseClient;