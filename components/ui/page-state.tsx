import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  className?: string;
  description?: string;
  icon?: LucideIcon;
  title: string;
};

export function EmptyState({
  className,
  description,
  icon: Icon = Inbox,
  title
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card px-4 py-8 text-center",
        className
      )}
    >
      <div className="mx-auto flex size-10 items-center justify-center rounded-lg border bg-background text-muted">
        <Icon className="size-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-text">{title}</h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}

type ErrorStateProps = {
  className?: string;
  description?: string;
  title?: string;
};

export function ErrorState({
  className,
  description = "数据暂时没有取回来，可以稍后重试。",
  title = "加载失败"
}: ErrorStateProps) {
  return (
    <EmptyState
      className={className}
      description={description}
      icon={AlertTriangle}
      title={title}
    />
  );
}

export function PageLoadingState() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm font-medium text-muted">
        <LoaderCircle className="size-4 animate-spin" />
        正在更新数据
      </div>
      <div className="rounded-lg border bg-card p-5">
        <SkeletonLine className="h-4 w-28" />
        <SkeletonLine className="mt-4 h-8 w-4/5" />
        <SkeletonLine className="mt-4 h-4 w-full" />
        <SkeletonLine className="mt-2 h-4 w-2/3" />
      </div>
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <SkeletonLine className="h-4 w-24" />
        <SkeletonLine className="h-4 w-16" />
      </div>
      <SkeletonLine className="mt-5 h-5 w-5/6" />
      <SkeletonLine className="mt-3 h-4 w-full" />
      <SkeletonLine className="mt-2 h-4 w-3/5" />
    </div>
  );
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-full bg-[color:color-mix(in_srgb,var(--border)_70%,transparent)]",
        className
      )}
    />
  );
}
