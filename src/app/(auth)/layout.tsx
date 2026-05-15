import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-[900px] bg-ride-mesh opacity-80" />
        <div className="absolute inset-x-0 top-0 h-[1200px] bg-ride-grid bg-ride-grid-sm [mask-image:radial-gradient(ellipse_60%_55%_at_50%_30%,black,transparent)]" />
      </div>
      <main className="relative w-full max-w-md">{children}</main>
    </div>
  );
}
