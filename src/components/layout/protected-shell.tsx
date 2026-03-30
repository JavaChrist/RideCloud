import type { ReactNode } from "react";
import { ProtectedHeader } from "@/components/layout/protected-header";

export function ProtectedShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <ProtectedHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
