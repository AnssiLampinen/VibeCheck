import { createClient } from '@supabase/supabase-js';

// Declare process to prevent TypeScript errors if Node types are missing
declare var process: any;

const getEnv = (key: string): string => {
  // 1. Try process.env (Common in Node/Webpack/Polyfilled environments)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore access errors
  }

  // 2. Try import.meta.env (Common in Vite/ESM environments)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore access errors
  }

  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Please check your environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).");
}

// Fallback to empty strings to prevent crash on initialization, but requests will fail if keys are missing
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');