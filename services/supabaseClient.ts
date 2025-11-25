
import { createClient } from '@supabase/supabase-js';
import { CapacitorStorage } from './storageAdapter';

// Hardcoded credentials to prevent "connection string is missing" errors
const supabaseUrl = 'https://koxukijufywvgnxqtuzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveHVraWp1Znl3dmdueHF0dXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTAyMzAsImV4cCI6MjA3MDY4NjIzMH0.GeINmM7cuyH1KMCO2JLGy1sY9UPv9n65Tp45TWBHneM';

if (!supabaseUrl || !supabaseKey) {
    console.error("CRITICAL: Supabase URL or Key is missing. Check supabaseClient.ts");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Faster load, as we handle auth state manually
        storage: CapacitorStorage,
    },
    // Improve global fetch behavior
    global: {
        headers: { 'x-application-name': 'lastbench-pwa' }
    }
});
