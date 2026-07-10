import webPush, { type PushSubscription } from "web-push";
import { createSupabaseServiceClient, hasSupabaseServiceConfig } from "@/lib/db";

type PushSubscriptionRow = {
  auth: string;
  endpoint: string;
  id: string;
  p256dh: string;
};

type PushPayload = {
  body: string;
  tag?: string;
  title: string;
  url: string;
};

type PushBrief = {
  summary: string;
  title: string;
};

export type PushSendResult = {
  disabled: number;
  failed: number;
  sent: number;
  skipped: boolean;
};

export function hasPushConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY &&
      process.env.WEB_PUSH_PRIVATE_KEY &&
      process.env.WEB_PUSH_SUBJECT
  );
}

export async function sendDailyBriefNotification(
  brief: PushBrief | null,
  date: string
): Promise<PushSendResult> {
  if (!hasPushConfig() || !hasSupabaseServiceConfig()) {
    return { disabled: 0, failed: 0, sent: 0, skipped: true };
  }

  const payload: PushPayload = {
    body: brief?.summary
      ? truncate(brief.summary, 110)
      : "今日赛程、重点新闻和聊球助手已经更新。",
    tag: `daily-brief-${date}`,
    title: brief?.title ?? "今日足球简报已生成",
    url: "/today"
  };

  return sendPushToEnabledSubscriptions(payload);
}

export async function sendTestNotification(endpoint: string) {
  if (!hasPushConfig() || !hasSupabaseServiceConfig()) {
    return { ok: false, error: "Push is not configured." };
  }

  configureWebPush();

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("endpoint", endpoint)
    .eq("enabled", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return { ok: false, error: "Subscription not found." };
  }

  await webPush.sendNotification(
    toWebPushSubscription(data as PushSubscriptionRow),
    JSON.stringify({
      body: "推送链路已经打通。之后每日简报生成后，会从这里提醒你。",
      tag: "clean-football-test",
      title: "Clean Football 推送测试",
      url: "/today"
    } satisfies PushPayload)
  );

  return { ok: true };
}

async function sendPushToEnabledSubscriptions(payload: PushPayload) {
  configureWebPush();

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("enabled", true);

  if (error) {
    throw error;
  }

  const subscriptions = (data ?? []) as PushSubscriptionRow[];
  const result: PushSendResult = {
    disabled: 0,
    failed: 0,
    sent: 0,
    skipped: false
  };

  for (const subscription of subscriptions) {
    try {
      await webPush.sendNotification(
        toWebPushSubscription(subscription),
        JSON.stringify(payload)
      );
      result.sent += 1;
      await supabase
        .from("push_subscriptions")
        .update({ last_error: null, last_sent_at: new Date().toISOString() })
        .eq("id", subscription.id);
    } catch (error) {
      result.failed += 1;
      const statusCode = getWebPushStatusCode(error);
      const disabled = statusCode === 404 || statusCode === 410;

      if (disabled) {
        result.disabled += 1;
      }

      const updatePayload: { enabled?: boolean; last_error: string } = {
        last_error: error instanceof Error ? error.message : String(error)
      };

      if (disabled) {
        updatePayload.enabled = false;
      }

      await supabase
        .from("push_subscriptions")
        .update(updatePayload)
        .eq("id", subscription.id);
    }
  }

  return result;
}

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;
  const subject = normalizeVapidSubject(process.env.WEB_PUSH_SUBJECT);

  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      "Missing NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY, WEB_PUSH_PRIVATE_KEY, or WEB_PUSH_SUBJECT."
    );
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
}

function normalizeVapidSubject(subject?: string) {
  if (!subject) {
    return subject;
  }

  if (subject.includes("://") || subject.startsWith("mailto:")) {
    return subject;
  }

  if (subject.includes("@")) {
    return `mailto:${subject}`;
  }

  return subject;
}

function toWebPushSubscription(row: PushSubscriptionRow): PushSubscription {
  return {
    endpoint: row.endpoint,
    keys: {
      auth: row.auth,
      p256dh: row.p256dh
    }
  };
}

function getWebPushStatusCode(error: unknown) {
  if (typeof error === "object" && error && "statusCode" in error) {
    return Number((error as { statusCode?: unknown }).statusCode);
  }

  return null;
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
}
