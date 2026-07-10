"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, BellOff, Send, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ?? "";

type PushStatus =
  | "idle"
  | "checking"
  | "enabled"
  | "disabled"
  | "unsupported"
  | "missing-config";

export function PushSettings() {
  const [status, setStatus] = useState<PushStatus>("checking");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const supportsPush = useMemo(
    () =>
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window,
    []
  );

  const checkSubscription = useCallback(async () => {
    if (!supportsPush) {
      setStatus("unsupported");
      return;
    }

    if (!publicKey) {
      setStatus("missing-config");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setStatus(subscription ? "enabled" : "disabled");
    } catch (error) {
      console.error(error);
      setStatus("disabled");
    }
  }, [supportsPush]);

  useEffect(() => {
    void checkSubscription();
  }, [checkSubscription]);

  async function enablePush() {
    setIsBusy(true);
    setMessage("");

    try {
      if (!supportsPush) {
        setStatus("unsupported");
        return;
      }

      if (!publicKey) {
        setStatus("missing-config");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setMessage("通知权限没有开启。你可以在系统设置里重新允许通知。");
        setStatus("disabled");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          applicationServerKey: urlBase64ToUint8Array(publicKey),
          userVisibleOnly: true
        }));

      const response = await fetch("/api/push/subscribe", {
        body: JSON.stringify(subscription),
        headers: { "content-type": "application/json" },
        method: "POST"
      });

      if (!response.ok) {
        throw new Error(`Failed to save subscription: ${response.status}`);
      }

      setMessage("每日简报推送已开启。");
      setStatus("enabled");
    } catch (error) {
      console.error(error);
      setMessage("开启推送失败，请确认已添加到主屏幕并允许通知。");
      setStatus("disabled");
    } finally {
      setIsBusy(false);
    }
  }

  async function disablePush() {
    setIsBusy(true);
    setMessage("");

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/push/subscribe", {
          body: JSON.stringify({ endpoint: subscription.endpoint }),
          headers: { "content-type": "application/json" },
          method: "DELETE"
        });
        await subscription.unsubscribe();
      }

      setMessage("每日简报推送已关闭。");
      setStatus("disabled");
    } catch (error) {
      console.error(error);
      setMessage("关闭推送失败，请稍后再试。");
    } finally {
      setIsBusy(false);
    }
  }

  async function sendTestPush() {
    setIsBusy(true);
    setMessage("");

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setStatus("disabled");
        setMessage("请先开启推送。");
        return;
      }

      const response = await fetch("/api/push/test", {
        body: JSON.stringify({ endpoint: subscription.endpoint }),
        headers: { "content-type": "application/json" },
        method: "POST"
      });

      if (!response.ok) {
        throw new Error(`Failed to send test push: ${response.status}`);
      }

      setMessage("测试通知已发送。");
    } catch (error) {
      console.error(error);
      setMessage("测试通知发送失败，请检查推送环境变量。");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="match-surface rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="accent-badge flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-accent">
          <Smartphone className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-text">iOS App 与每日推送</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            在 iPhone Safari 中添加到主屏幕后，可以开启每日 09:00 简报通知。
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border bg-background p-3 text-sm leading-6 text-muted">
        iPhone 使用方式：Safari 打开本站，点击分享按钮，选择「添加到主屏幕」。
        之后从桌面图标打开 Clean Football，再开启推送。
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {status === "enabled" ? (
          <Button disabled={isBusy} onClick={disablePush} type="button">
            <BellOff className="mr-2 size-4" />
            关闭每日推送
          </Button>
        ) : (
          <Button disabled={isBusy || status === "unsupported"} onClick={enablePush} type="button">
            <Bell className="mr-2 size-4" />
            开启每日推送
          </Button>
        )}

        <Button
          disabled={isBusy || status !== "enabled"}
          onClick={sendTestPush}
          type="button"
          variant="outline"
        >
          <Send className="mr-2 size-4" />
          发送测试通知
        </Button>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted">
        {statusLabel(status)}
        {message ? ` ${message}` : ""}
      </p>
    </section>
  );
}

function statusLabel(status: PushStatus) {
  if (status === "checking") {
    return "正在检查推送状态。";
  }

  if (status === "enabled") {
    return "当前设备已开启推送。";
  }

  if (status === "missing-config") {
    return "推送尚未配置 VAPID public key。";
  }

  if (status === "unsupported") {
    return "当前浏览器不支持 Web Push；iOS 需要从主屏幕打开。";
  }

  return "当前设备未开启推送。";
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}
