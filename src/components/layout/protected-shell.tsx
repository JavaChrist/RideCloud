import type { ReactNode } from "react";
import { ProtectedHeader } from "@/components/layout/protected-header";

export function ProtectedShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <ProtectedHeader />
      <main className="w-full px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
