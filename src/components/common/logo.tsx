import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link href="/categories" className="inline-flex items-center gap-3">
      <Image
        src="/icons/RideCloud.png"
        alt="RideCloud"
        width={compact ? 36 : 86}
        height={compact ? 36 : 86}
        className="rounded-xl"
        priority
      />
      {!compact && <span className="text-xl font-semibold tracking-tight text-slate-900">RideCloud</span>}
    </Link>
  );
}
