import { createClient } from '@supabase/supabase-js';

// Declare the window.env type
declare global {
  interface Window {
    env?: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
    };
  }
}

// Try multiple methods to get the Supabase credentials
const FALLBACK_SUPABASE_URL = 'https://upbxwrjsxkiyqgqzihei.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwYnh3cmpzeGtpeXFncXppaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxOTg4MzMsImV4cCI6MjA1NTc3NDgzM30.n3ROVGXoZRGD8yqppwOnvoSrpI6NK-6CqyDQg9bAmfU';

// Try to get environment variables in order of preference:
// 1. Vite import.meta.env (for development)
// 2. Window.env (injected via HTML)
// 3. Hardcoded fallback values (last resort)
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  (typeof window !== 'undefined' && window.env ? window.env.VITE_SUPABASE_URL : '') ||
  FALLBACK_SUPABASE_URL;

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  (typeof window !== 'undefined' && window.env ? window.env.VITE_SUPABASE_ANON_KEY : '') ||
  FALLBACK_SUPABASE_ANON_KEY;

// Log a warning but don't stop execution - we have fallbacks
if ((!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && 
    (!window.env?.VITE_SUPABASE_URL || !window.env?.VITE_SUPABASE_ANON_KEY)) {
  console.warn('Using fallback Supabase credentials. Environment variables were not found.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 