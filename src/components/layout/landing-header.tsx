"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeMenuRow, ThemeToggle } from "@/components/common/theme-toggle";
import { MobileHeaderMenu, MobileMenuAnchor, MobileMenuLink } from "@/components/layout/mobile-header-menu";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-slate-50/70 pt-safe-top backdrop-blur-xl supports-[backdrop-filter]:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/70 dark:supports-[backdrop-filter]:bg-slate-950/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5">
          <Image
            src="/icons/RideCloud.png"
            alt="RideCloud"
            width={36}
            height={36}
            className="shrink-0 rounded-xl shadow-ride-glow-sm transition-transform duration-300 group-hover:scale-105"
          />
          <span className="truncate text-[15px] font-semibold tracking-tight">RideCloud</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <HeaderLink href="#features">Fonctionnalités</HeaderLink>
          <HeaderLink href="#benefits">Bénéfices</HeaderLink>
          <HeaderLink href="/tarifs" asLink>
            Tarifs
          </HeaderLink>
          <HeaderLink href="#faq">FAQ</HeaderLink>
          <HeaderLink href="/login" asLink>
            Connexion
          </HeaderLink>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle className="hidden md:inline-flex" />
          <Button
            asChild
            size="sm"
            className="group/cta relative hidden overflow-hidden bg-ride-gradient-primary text-white shadow-ride-glow-sm transition-all duration-300 hover:shadow-ride-glow hover:brightness-110 md:inline-flex"
          >
            <Link href="/register">
              Commencer gratuitement
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" strokeWidth={2.25} />
            </Link>
          </Button>
          <MobileHeaderMenu>
            <MobileMenuAnchor href="#features">Fonctionnalités</MobileMenuAnchor>
            <MobileMenuAnchor href="#benefits">Bénéfices</MobileMenuAnchor>
            <MobileMenuLink href="/tarifs">Tarifs</MobileMenuLink>
            <MobileMenuAnchor href="#faq">FAQ</MobileMenuAnchor>
            <MobileMenuLink href="/login">Connexion</MobileMenuLink>
            <ThemeMenuRow />
          </MobileHeaderMenu>
        </div>
      </div>
    </header>
  );
}

function HeaderLink({
  href,
  children,
  asLink = false
}: {
  href: string;
  children: React.ReactNode;
  asLink?: boolean;
}) {
  const className =
    "relative text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-slate-900 dark:hover:text-slate-50 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-blue-700 after:transition-transform after:duration-300 hover:after:scale-x-100";
  return asLink ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
