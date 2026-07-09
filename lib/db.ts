import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function hasSupabaseAnonConfig() {
  return Boolean(getSupabaseUrl() && getAnonKey());
}

export function hasSupabaseServiceConfig() {
  return Boolean(getSupabaseUrl() && getServiceRoleKey());
}

export function createSupabaseAnonClient(): SupabaseClient {
  const supabaseUrl = getSupabaseUrl();
  const anonKey = getAnonKey();

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false
    }
  });
}

export function createSupabaseServiceClient(): SupabaseClient {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });
}

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}
