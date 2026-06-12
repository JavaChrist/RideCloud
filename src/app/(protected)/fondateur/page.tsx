import type { Metadata } from "next";
import { FounderWelcome } from "@/components/founder/founder-welcome";

export const metadata: Metadata = {
  title: "Programme Membres Fondateurs · RideCloud",
  description:
    "Rejoignez les 100 premiers Membres Fondateurs RideCloud. Premium à vie en échange d'un retour d'expérience de 5 minutes."
};

export default function FounderPage() {
  return <FounderWelcome />;
}
