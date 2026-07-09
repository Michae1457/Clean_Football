"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/page-state";

export default function Error({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4">
      <ErrorState description="数据源或网络请求暂时不可用，稍后再试一次。" />
      <Button className="w-full" onClick={reset} type="button">
        <RotateCcw className="mr-2 size-4" />
        重新加载
      </Button>
    </div>
  );
}
