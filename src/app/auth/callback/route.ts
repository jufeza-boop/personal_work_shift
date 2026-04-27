import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth", request.url), {
      status: 307,
    });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth", request.url), {
      status: 307,
    });
  }

  return NextResponse.redirect(new URL("/calendar", request.url), {
    status: 307,
  });
}
