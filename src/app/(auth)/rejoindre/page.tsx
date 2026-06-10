import { Logo } from "@/components/common/logo";
import { BetaRegisterForm } from "@/components/auth/beta-register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Rejoindre la bêta — RideCloud",
  description: "Accédez gratuitement à RideCloud pendant 30 jours en tant que bêta testeur."
};

export default function RejoindreBetagPage() {
  return (
    <Card className="relative w-full overflow-hidden rounded-2xl border-slate-200/80 dark:border-slate-800/80 bg-ride-gradient-card shadow-ride-xl backdrop-blur-sm">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent"
      />
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto">
          <Logo compact />
        </div>
        <div className="flex justify-center">
          <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400">
            Accès bêta — 30 jours gratuits
          </Badge>
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Rejoindre la bêta
        </CardTitle>
        <CardDescription>
          Vous avez un code d&apos;invitation ? Créez votre compte et profitez de 30 jours d&apos;accès Premium complet, gratuitement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BetaRegisterForm />
      </CardContent>
    </Card>
  );
}
