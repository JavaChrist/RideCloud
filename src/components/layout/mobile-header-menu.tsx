"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItemClassName =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50";

interface MobileHeaderMenuProps {
  children: ReactNode;
  className?: string;
}

export function MobileHeaderMenu({ children, className }: MobileHeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const header = buttonRef.current?.closest("header");
    if (!header) return;

    const update = () => {
      setPanelTop(header.getBoundingClientRect().bottom);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <div className={cn("md:hidden", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setOpen((current) => !current)}
        className="relative z-50 inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
      >
        {open ? <X className="h-5 w-5" strokeWidth={2} aria-hidden /> : <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />}
      </button>

      {open ? (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="fixed inset-0 z-40 bg-slate-950/25"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            ref={panelRef}
            role="navigation"
            aria-label="Menu"
            tabIndex={-1}
            style={{ top: panelTop }}
            className="fixed inset-x-0 z-50 border-b border-slate-200/80 bg-slate-50/95 px-4 py-3 shadow-lg outline-none backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95"
            onClick={(event) => {
              const target = event.target as HTMLElement;
              if (target.closest("a, [data-menu-close]")) setOpen(false);
            }}
          >
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-1">{children}</div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function MobileMenuLink({
  href,
  children,
  className
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(menuItemClassName, className)}>
      {children}
    </Link>
  );
}

export function MobileMenuAnchor({
  href,
  children,
  className
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={cn(menuItemClassName, className)}>
      {children}
    </a>
  );
}

export { menuItemClassName };
