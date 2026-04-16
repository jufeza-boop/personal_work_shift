import { NextResponse } from "next/server";
import { SubscribeToPush } from "@/application/use-cases/push/SubscribeToPush";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";
import { createServerPushDependencies } from "@/infrastructure/push/runtime";

export async function POST(request: Request): Promise<NextResponse> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("endpoint" in body) ||
    !("keys" in body) ||
    typeof (body as Record<string, unknown>).endpoint !== "string" ||
    typeof (body as Record<string, unknown>).keys !== "object"
  ) {
    return NextResponse.json(
      { error: "Missing or invalid subscription fields" },
      { status: 400 },
    );
  }

  const { endpoint, keys } = body as {
    endpoint: string;
    keys: Record<string, unknown>;
  };

  if (typeof keys.auth !== "string" || typeof keys.p256dh !== "string") {
    return NextResponse.json(
      { error: "Missing subscription keys" },
      { status: 400 },
    );
  }

  const { pushSubscriptionRepository } = await createServerPushDependencies();
  const useCase = new SubscribeToPush(pushSubscriptionRepository);
  const result = await useCase.execute({
    endpoint,
    keysAuth: keys.auth,
    keysP256dh: keys.p256dh,
    userId: user.id,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
