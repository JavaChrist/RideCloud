import { Logo } from "@/components/common/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function ProtectedHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-200/70 bg-slate-50/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl supports-[backdrop-filter]:bg-slate-50/50">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-700/25 to-transparent"
      />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Logo compact />
        <SignOutButton />
      </div>
    </header>
  );
}
