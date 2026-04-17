import { NextResponse } from "next/server";
import { vapidPublicKey } from "@/infrastructure/push/runtime";

export function GET(): NextResponse {
  const key = vapidPublicKey();

  if (!key) {
    return NextResponse.json(
      { error: "VAPID public key not configured" },
      { status: 503 },
    );
  }

  return NextResponse.json({ vapidPublicKey: key });
}
