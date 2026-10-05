"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Pencil, Plus, X } from "lucide-react";
import { AdminSidebar, SidebarContent } from "@/components/admin/sidebar";
import { AdminTopBar } from "@/components/admin/topbar";
import { LogoutButton } from "@/components/site/logout-button";

// Client wrapper around the admin chrome: fixed sidebar on desktop, a
// slide-over drawer on mobile/tablet, and the sticky header with a
// hamburger. Kept out of layout.tsx so the drawer state can live in React
// while the layout itself stays a server component.
export function AdminShell({
  user,
  children,
}: {
  user: { name: string; role: string };
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const [panelTitle, setPanelTitle] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const wasEditing = useRef(false);
  const submitState = useRef<{ at: number; sawPending: boolean } | null>(null);
  const initial = user.name.trim().charAt(0).toUpperCase();

  // Lock body scroll while the drawer is open, and close it on Escape.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  // Copy each table's column headings onto its cells as data-label, so the
  // phone layout in globals.css can show "Status: Active" style cards. Tables
  // are client-rendered and re-filtered, so keep stamping as rows change.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const stamp = () => {
      main.querySelectorAll("table").forEach((table) => {
        const labels = Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent?.trim() ?? "");
        table.querySelectorAll("tbody tr").forEach((tr) => {
          Array.from(tr.children).forEach((td, i) => {
            const label = labels[i] ?? "";
            if (td.getAttribute("data-label") !== label) td.setAttribute("data-label", label);
          });
        });
      });
    };
    // Add/Edit form panel: below lg the CSS turns it into a bottom sheet that
    // a header button opens, instead of leaving it under a long table.
    const narrow = () => window.matchMedia("(max-width: 1023px)").matches;
    const syncPanel = () => {
      const panel = main.querySelector<HTMLElement>(".admin-form-panel");
      if (!panel) {
        wasEditing.current = false;
        submitState.current = null;
        setPanelTitle(null);
        setSheetOpen(false);
        return;
      }
      const title = panel.querySelector("h3")?.textContent?.trim() ?? "Form";
      const editing = /^edit/i.test(title);
      setPanelTitle(title);
      // Clicking Edit on a row swaps the heading — pop the sheet open for it,
      // and put it away again once the edit is saved or cancelled.
      if (editing && !wasEditing.current && narrow()) setSheetOpen(true);
      if (!editing && wasEditing.current) setSheetOpen(false);
      wasEditing.current = editing;

      // After a submit: close once saving finishes without an error showing.
      const submit = submitState.current;
      if (submit) {
        const button = panel.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (button?.disabled) submit.sawPending = true;
        else if (submit.sawPending) {
          submitState.current = null;
          if (!panel.querySelector(".text-red-600")) setSheetOpen(false);
        } else if (Date.now() - submit.at > 15000) submitState.current = null;
      }
    };
    const onSubmit = (e: Event) => {
      if ((e.target as HTMLElement).closest(".admin-form-panel")) {
        submitState.current = { at: Date.now(), sawPending: false };
      }
    };
    const run = () => {
      stamp();
      syncPanel();
    };
    run();
    main.addEventListener("submit", onSubmit, true);
    const observer = new MutationObserver(run);
    observer.observe(main, { childList: true, subtree: true, characterData: true });
    return () => {
      main.removeEventListener("submit", onSubmit, true);
      observer.disconnect();
    };
  }, []);

  // Reflect the sheet state onto the panel, lock page scroll while it is up,
  // and let Escape / a tap on the dimmed backdrop dismiss it.
  useEffect(() => {
    const panel = mainRef.current?.querySelector<HTMLElement>(".admin-form-panel");
    if (panel) panel.dataset.sheet = sheetOpen ? "open" : "closed";
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest(".admin-form-panel, [data-sheet-ui]")) setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      document.body.style.overflow = prev;
    };
  }, [sheetOpen, panelTitle]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50/50 via-surface to-indigo-50/40">
      <AdminSidebar role={user.role} />

      {/* Mobile drawer */}
      <div className="lg:hidden" hidden={!drawerOpen}>
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
        <div className="fixed inset-y-0 left-0 z-50 flex w-64 max-w-[80vw] flex-col border-r border-border bg-surface shadow-xl">
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-muted hover:bg-black/5 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent role={user.role} onNavigate={() => setDrawerOpen(false)} />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-border bg-paper/80 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="-ml-1 rounded-md p-2 text-ink hover:bg-black/5 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <AdminTopBar />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {panelTitle && (
              <button
                type="button"
                data-sheet-ui
                onClick={() => setSheetOpen(true)}
                className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm lg:hidden"
              >
                {/^edit/i.test(panelTitle) ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {/^edit/i.test(panelTitle) ? "Edit" : "Add"}
              </button>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-sm font-semibold text-white">
              {initial}
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted">{user.role.replace(/_/g, " ")}</p>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main ref={mainRef} className="admin-main p-4 sm:p-6 lg:p-8">{children}</main>
        {sheetOpen && (
          <button
            type="button"
            data-sheet-ui
            onClick={() => setSheetOpen(false)}
            aria-label="Close form"
            className="fixed right-3 top-3 z-[70] rounded-full bg-paper p-2 text-ink shadow-lg lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
