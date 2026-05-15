import type { ReactNode } from "react";
import { ProtectedHeader } from "@/components/layout/protected-header";

export function ProtectedShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-[900px] bg-ride-mesh opacity-80" />
        <div className="absolute inset-x-0 top-0 h-[1200px] bg-ride-grid bg-ride-grid-sm [mask-image:radial-gradient(ellipse_60%_45%_at_50%_0%,black,transparent)]" />
      </div>

      <ProtectedHeader />
      <main className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-[calc(env(safe-area-inset-top)+7rem)] md:px-6">
        {children}
      </main>
    </div>
  );
}
