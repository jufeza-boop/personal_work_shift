import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getAppEnv } from "@/shared/config/env";
import type { Database } from "./database.types";

export type ServerSupabaseClient = SupabaseClient<Database>;

export async function createServerSupabaseClient(): Promise<ServerSupabaseClient> {
  const cookieStore = await cookies();
  const env = getAppEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}
