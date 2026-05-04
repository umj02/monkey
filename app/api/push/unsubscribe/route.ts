import { NextResponse } from "next/server";
import { createAdminClient, getUserFromRequest, hasSupabaseAdminEnv } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasSupabaseAdminEnv()) return NextResponse.json({ error: "Push admin env is not configured." }, { status: 500 });
  const user = await getUserFromRequest(request);
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { endpoint?: string } | null;
  if (!body?.endpoint) return NextResponse.json({ error: "Missing endpoint." }, { status: 400 });

  const supabase = createAdminClient() as any;
  const { error } = await supabase
    .from("push_subscriptions")
    .update({ enabled: false, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("endpoint", body.endpoint);

  if (error) return NextResponse.json({ error: "Could not unsubscribe." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
