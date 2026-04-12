import type { ReactNode } from "react";
import { ProtectedHeader } from "@/components/layout/protected-header";

export function ProtectedShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100">
      <ProtectedHeader />
      <main className="w-full px-4 pb-6 pt-[calc(env(safe-area-inset-top)+7rem)] md:px-6">{children}</main>
    </div>
  );
}
