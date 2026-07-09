import { CheckCircle2 } from "lucide-react";
import type { DailyBrief } from "@/lib/types";

export function DailyBriefCard({ brief }: { brief: DailyBrief | null }) {
  if (!brief) {
    return (
      <section className="rounded-lg border bg-card p-5 shadow-card">
        <div className="noise-line mb-5 h-1.5 rounded-full" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted">今日简报</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-text">
              简报还没生成
            </h2>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-background text-muted">
            <CheckCircle2 className="size-5" />
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">
          今天暂时没有可用简报；新闻和赛程同步后会自动更新。
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border bg-card p-5 shadow-card">
      <div className="noise-line mb-5 h-1.5 rounded-full" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted">{brief.date}</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-text">
            {brief.title}
          </h2>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-black">
          <CheckCircle2 className="size-5" />
        </div>
      </div>
      <p className="mt-4 whitespace-pre-line text-base leading-7 text-text">
        {brief.summary}
      </p>
      <div className="mt-5 space-y-3">
        {brief.bullets.map((bullet) => (
          <div className="flex gap-3 text-sm leading-6" key={bullet}>
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
            <p className="text-muted">{bullet}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
