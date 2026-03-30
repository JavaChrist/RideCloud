import Image from "next/image";
import Link from "next/link";

const imageMap = {
  voitures: "/icons/logo_voiture.png",
  motos: "/icons/logo_moto.png",
  scooters: "/icons/logo_scooter1.png",
  utilitaires: "/icons/logo_utilitaire.png"
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
      className="group flex items-center justify-center rounded-xl p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={title}
    >
      <Image
        src={imageSrc}
        alt={title}
        width={280}
        height={280}
        className="h-40 w-40 object-contain transition-transform duration-200 group-hover:scale-105 sm:h-48 sm:w-48"
        priority
      />
      <span className="sr-only">{title}</span>
    </Link>
  );
}
