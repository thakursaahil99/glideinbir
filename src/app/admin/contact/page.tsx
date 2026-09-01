"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, Badge } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [isPending, startTransition] = useTransition();

  function load() {
    fetch("/api/admin/contact")
      .then((res) => res.json())
      .then((body) => setMessages(body.success ? body.data : []));
  }

  useEffect(load, []);

  function toggleRead(message: ContactMessage) {
    startTransition(async () => {
      await fetch(`/api/admin/contact/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !message.isRead }),
      });
      load();
    });
  }

  const unreadCount = messages?.filter((m) => !m.isRead).length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Contact messages</h1>
      <p className="mt-1 text-sm text-muted">
        {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"} — every submission is also
        emailed to the Super Admin.
      </p>

      <div className="mt-6 space-y-4">
        {messages?.map((message) => (
          <Card key={message.id} className={message.isRead ? "p-5" : "border-brand/40 bg-brand/5 p-5"}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{message.name}</h3>
                  {!message.isRead && <Badge className="bg-brand/10 text-brand">New</Badge>}
                </div>
                <p className="text-sm text-muted">
                  {message.email}
                  {message.phone ? ` · ${message.phone}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-muted">{formatDate(message.createdAt)}</p>
                <button
                  type="button"
                  onClick={() => toggleRead(message)}
                  disabled={isPending}
                  className="mt-2 rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
                >
                  {message.isRead ? "Mark unread" : "Mark read"}
                </button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{message.message}</p>
          </Card>
        ))}
        {messages && messages.length === 0 && (
          <Card className="p-8 text-center text-muted">No messages yet.</Card>
        )}
        {!messages && <Card className="p-8 text-center text-muted">Loading…</Card>}
      </div>
    </div>
  );
}
