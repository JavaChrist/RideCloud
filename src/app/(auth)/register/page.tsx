import { Logo } from "@/components/common/logo";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card className="relative w-full overflow-hidden rounded-2xl border-slate-200/80 bg-ride-gradient-card shadow-ride-xl backdrop-blur-sm">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent"
      />
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto">
          <Logo compact />
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Créer un compte
        </CardTitle>
        <CardDescription>Créez votre espace RideCloud.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
