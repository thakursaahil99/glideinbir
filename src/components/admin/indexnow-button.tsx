"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

// One-click resubmit of every public URL to IndexNow (Bing/Yandex/Seznam/
// Naver — not Google, which doesn't take part in the protocol) so new or
// changed packages/courses/hotels/etc. don't have to wait for those
// crawlers' next natural pass.
export function IndexNowButton() {
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<string | null>(null);
  const toast = useToast();

  function submit() {
    startTransition(async () => {
      const res = await fetch("/api/admin/seo/indexnow", { method: "POST" });
      const body = await res.json();
      if (!res.ok || !body.success) {
        toast.error(body.error?.message ?? "Could not notify search engines.");
        return;
      }
      setLastResult(`${body.data.submitted} URLs submitted just now.`);
      toast.success("Search engines notified.");
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="sm" onClick={submit} disabled={isPending}>
        {isPending ? "Notifying…" : "Notify search engines"}
      </Button>
      {lastResult && <span className="text-xs text-muted">{lastResult}</span>}
    </div>
  );
}
