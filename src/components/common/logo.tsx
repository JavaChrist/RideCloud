import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  const size = compact ? 36 : 64;

  return (
    <Link
      href="/categories"
      className="group inline-flex items-center gap-2.5"
      aria-label="RideCloud — Accueil"
    >
      <div className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-ride-glow-sm transition-transform duration-300 group-hover:scale-105">
        <Image
          src="/icons/RideCloud.png"
          alt="RideCloud"
          width={size}
          height={size}
          className="block"
          priority
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/15 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      </div>
      <span
        className={
          compact
            ? "text-[15px] font-semibold tracking-tight text-slate-900"
            : "text-xl font-semibold tracking-tight text-slate-900"
        }
      >
        RideCloud
      </span>
    </Link>
  );
}
