import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials for simplicity
const supabaseUrl = 'https://upbxwrjsxkiyqgqzihei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwYnh3cmpzeGtpeXFncXppaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxOTg4MzMsImV4cCI6MjA1NTc3NDgzM30.n3ROVGXoZRGD8yqppwOnvoSrpI6NK-6CqyDQg9bAmfU';

// Create the Supabase client directly with hardcoded values
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 