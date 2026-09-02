"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  isActive: boolean;
  publishedAt: string;
};

const EMPTY_FORM = { title: "", excerpt: "", body: "", coverImage: "", isActive: true };

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY_FORM);

  function load() {
    fetch("/api/admin/blog")
      .then((res) => res.json())
      .then((body) => setPosts(body.success ? body.data : []));
  }

  useEffect(load, []);

  function startEdit(post: Post) {
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      coverImage: post.coverImage ?? "",
      isActive: post.isActive,
    });
    setEditingId(post.id);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = { ...form, coverImage: form.coverImage.trim() || undefined };
      const url = editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.error?.message ?? "Could not save.");
        return;
      }
      cancelEdit();
      load();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this post? You can restore it later from Deleted data (Super Admin only).")) return;
    startTransition(async () => {
      await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (editingId === id) cancelEdit();
      load();
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
      <p className="mt-1 text-sm text-muted">
        Articles shown at /blog — good for organic search (best time to visit, how to reach Bir,
        that kind of thing).
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts?.map((post) => (
                <tr
                  key={post.id}
                  className={
                    post.id === editingId
                      ? "border-b border-border bg-brand/5 last:border-0 ring-1 ring-inset ring-brand/15"
                      : "border-b border-border last:border-0 transition-colors hover:bg-black/[0.025]"
                  }
                >
                  <td className="px-4 py-3 font-medium">{post.title}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(post.publishedAt)}</td>
                  <td className="px-4 py-3">
                    <Badge className={post.isActive ? "" : "bg-red-50 text-red-700"}>
                      {post.isActive ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => startEdit(post)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      disabled={isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {posts && posts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No posts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="h-fit p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editingId ? "Edit post" : "New post"}</h3>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-xs font-medium text-muted hover:text-ink">
                Cancel
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Excerpt (shown on the /blog list)</label>
              <textarea
                required
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cover image URL (optional)</label>
              <input
                type="url"
                value={form.coverImage}
                onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Body (blank lines start new paragraphs)</label>
              <textarea
                required
                rows={12}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-xs"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Published (visible on the site)
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Saving…" : editingId ? "Save changes" : "Publish"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
