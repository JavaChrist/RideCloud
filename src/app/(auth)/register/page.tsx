import { Logo } from "@/components/common/logo";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md rounded-2xl border bg-white shadow-soft">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto"><Logo compact /></div>
        <CardTitle className="text-2xl">Créer un compte</CardTitle>
        <CardDescription>Créez votre espace RideCloud.</CardDescription>
      </CardHeader>
      <CardContent><RegisterForm /></CardContent>
    </Card>
  );
}
