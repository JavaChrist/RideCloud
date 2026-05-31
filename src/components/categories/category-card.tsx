import Image from "next/image";
import Link from "next/link";

const imageMap = {
  voitures: "/icons/logo_voiture.png",
  motos: "/icons/logo_moto.png",
  scooters: "/icons/logo_scooter1.png",
  utilitaires: "/icons/logo_utilitaire.png"
};

const labelMap = {
  voitures: "Voitures",
  motos: "Motos",
  scooters: "Scooters",
  utilitaires: "Utilitaires"
};

interface CategoryCardProps {
  slug: "voitures" | "motos" | "scooters" | "utilitaires";
  title: string;
}

export function CategoryCard({ slug, title }: CategoryCardProps) {
  const imageSrc = imageMap[slug];

  return (
    <Link
      href={`/vehicules/${slug}`}
      aria-label={title}
      className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-ride-gradient-card p-5 shadow-ride-xs transition-all duration-500 ease-ride-spring hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-ride-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_0%,rgba(29,78,216,0.10),transparent_65%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <Image
        src={imageSrc}
        alt={labelMap[slug]}
        width={280}
        height={280}
        className="h-32 w-32 object-contain transition-transform duration-500 ease-ride-spring group-hover:scale-110 sm:h-40 sm:w-40"
        priority
      />
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300 sm:text-base">
        {labelMap[slug]}
      </span>
    </Link>
  );
}
