import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/common/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 p-4">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-[900px] bg-ride-mesh opacity-80" />
        <div className="absolute inset-x-0 top-0 h-[1200px] bg-ride-grid dark:bg-ride-grid-light bg-ride-grid-sm [mask-image:radial-gradient(ellipse_60%_55%_at_50%_30%,black,transparent)]" />
      </div>
      <div className="fixed right-4 top-[calc(env(safe-area-inset-top)+1rem)] z-20">
        <ThemeToggle />
      </div>
      <main className="relative w-full max-w-md">{children}</main>
    </div>
  );
}
