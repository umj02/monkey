import { NextResponse } from "next/server";
import { createAdminClient, getUserFromRequest, hasSupabaseAdminEnv } from "@/lib/supabase/server";

type PushSubscriptionPayload = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ error: "Push admin env is not configured." }, { status: 500 });
  }

  const user = await getUserFromRequest(request);
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { subscription?: PushSubscriptionPayload; timezone?: string } | null;
  const subscription = body?.subscription;
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Invalid push subscription." }, { status: 400 });
  }

  const supabase = createAdminClient() as any;
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
        timezone: body?.timezone || "America/Costa_Rica",
        user_agent: request.headers.get("user-agent") || null,
        enabled: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );

  if (error) return NextResponse.json({ error: "Could not save subscription." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
