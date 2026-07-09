import { NextResponse } from "next/server";
import { createSupabaseServiceClient, hasSupabaseServiceConfig } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PushSubscriptionBody = {
  endpoint?: unknown;
  keys?: {
    auth?: unknown;
    p256dh?: unknown;
  };
};

export async function POST(request: Request) {
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json(
      { error: "Supabase service config is missing." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as PushSubscriptionBody;
  const subscription = parseSubscription(body);

  if (!subscription) {
    return NextResponse.json(
      { error: "Invalid push subscription." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      auth: subscription.auth,
      enabled: true,
      endpoint: subscription.endpoint,
      last_error: null,
      p256dh: subscription.p256dh,
      user_agent: request.headers.get("user-agent")
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save push subscription." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json(
      { error: "Supabase service config is missing." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as { endpoint?: unknown };
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : null;

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint." }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .update({ enabled: false })
    .eq("endpoint", endpoint);

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to disable push subscription." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

function parseSubscription(body: PushSubscriptionBody) {
  if (
    typeof body.endpoint !== "string" ||
    typeof body.keys?.p256dh !== "string" ||
    typeof body.keys?.auth !== "string"
  ) {
    return null;
  }

  return {
    auth: body.keys.auth,
    endpoint: body.endpoint,
    p256dh: body.keys.p256dh
  };
}
