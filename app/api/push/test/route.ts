import { NextResponse } from "next/server";
import { sendTestNotification } from "@/lib/push";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { endpoint?: unknown };
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : null;

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint." }, { status: 400 });
    }

    const result = await sendTestNotification(endpoint);

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to send test notification." },
      { status: 500 }
    );
  }
}
