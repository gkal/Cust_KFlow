import { supabase as projectSupabase } from '@/lib/supabase'; // Using your project's path
// @ts-ignore: Type is used for type checking
import type { Database } from '@stepper/types/supabase';
// @ts-ignore: Used for documentation
import { createClient } from '@supabase/supabase-js';

// Re-export your project's client to avoid duplicate instances
export const supabase = projectSupabase;

// Helper function to get the current user ID (simplified for the example)
export const getUserId = (): string => {
  return '84045ca4-07c7-42b4-a025-97534bc35839'; // Default user ID for the example
};

// Helper function to get a valid customer ID for testing
export const getTestCustomerId = (): string => {
  return '8569f00d-64ef-4675-aaa1-01aea78a4c14'; // Valid customer ID for "aabbb"
};