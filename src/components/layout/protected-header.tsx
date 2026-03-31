import { Logo } from "@/components/common/logo";

export function ProtectedHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="flex w-full items-center px-4 py-3 md:px-6">
        <Logo />
      </div>
    </header>
  );
}
