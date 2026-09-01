"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CircleCheck, CircleAlert, X } from "lucide-react";
import { clsx } from "clsx";

type ToastKind = "success" | "error";
type Toast = { id: number; kind: ToastKind; message: string };

const ToastContext = createContext<{
  success: (message: string) => void;
  error: (message: string) => void;
} | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider
      value={{
        success: (message: string) => push("success", message),
        error: (message: string) => push("error", message),
      }}
    >
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={clsx(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md",
              toast.kind === "success" ? "border-emerald-200 bg-emerald-50/95" : "border-red-200 bg-red-50/95",
            )}
          >
            {toast.kind === "success" ? (
              <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            )}
            <p className="flex-1 text-sm font-medium text-ink">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="text-muted hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast() must be used inside <ToastProvider>");
  return ctx;
}
