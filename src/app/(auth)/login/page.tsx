import { Logo } from "@/components/common/logo";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md rounded-2xl border bg-white shadow-soft">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto"><Logo compact /></div>
        <CardTitle className="text-2xl">Connexion</CardTitle>
        <CardDescription>Connectez-vous à RideCloud pour suivre vos véhicules.</CardDescription>
      </CardHeader>
      <CardContent><LoginForm /></CardContent>
    </Card>
  );
}
