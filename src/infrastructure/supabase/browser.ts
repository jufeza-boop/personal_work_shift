"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getAppEnv } from "@/shared/config/env";
import type { Database } from "@/infrastructure/supabase/database.types";

export function createBrowserSupabaseClient() {
  const env = getAppEnv();
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
