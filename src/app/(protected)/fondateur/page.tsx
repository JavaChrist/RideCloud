import type { Metadata } from "next";
import { FounderWelcome } from "@/components/founder/founder-welcome";

export const metadata: Metadata = {
  title: "Beta Club JavaChrist · RideCloud",
  description:
    "Découvrez les campagnes de test RideCloud via le Beta Club JavaChrist. Les accès dépendent des missions, des prérequis et des validations de l'équipe."
};

export default function FounderPage() {
  return <FounderWelcome />;
}
