import type { Metadata } from "next";
import { FounderQuestionnaire } from "@/components/founder/founder-questionnaire";

export const metadata: Metadata = {
  title: "Questionnaire Fondateur · RideCloud",
  description:
    "5 minutes pour partager votre retour, débloquer le Premium à vie et le badge Membre Fondateur."
};

export default function FounderQuestionnairePage() {
  return <FounderQuestionnaire />;
}
