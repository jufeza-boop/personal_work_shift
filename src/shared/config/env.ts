import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1),
});

export type AppEnv = z.infer<typeof publicEnvSchema>;

export function getAppEnv(
  source: Record<string, string | undefined> = process.env,
): AppEnv {
  const result = publicEnvSchema.safeParse(source);

  if (!result.success) {
    throw new Error("Invalid environment variables");
  }

  return result.data;
}
