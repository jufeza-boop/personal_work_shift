import { NextResponse } from "next/server";
import { UnsubscribeFromPush } from "@/application/use-cases/push/UnsubscribeFromPush";
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
    typeof (body as Record<string, unknown>).endpoint !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing endpoint field" },
      { status: 400 },
    );
  }

  const { endpoint } = body as { endpoint: string };
  const { pushSubscriptionRepository } = await createServerPushDependencies();
  const useCase = new UnsubscribeFromPush(pushSubscriptionRepository);
  await useCase.execute({ endpoint, userId: user.id });

  return NextResponse.json({ success: true });
}
