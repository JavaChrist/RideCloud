import { Sparkles } from "lucide-react";
import { AddVehicleForm } from "@/components/vehicles/add-vehicle-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewVehiclePage() {
  return (
    <section className="space-y-6">
      <div>
        <Badge
          variant="outline"
          className="mb-3 gap-1.5 rounded-full border-blue-200 bg-white/70 px-3 py-1 text-xs font-medium text-blue-700 shadow-ride-xs backdrop-blur"
        >
          <Sparkles className="h-3 w-3" strokeWidth={2.5} />
          Nouveau véhicule
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Ajouter un véhicule
        </h1>
        <p className="text-slate-600">
          Créez une fiche complète avec les informations de base.
        </p>
      </div>
      <Card className="relative overflow-hidden rounded-2xl border-slate-200/80 bg-ride-gradient-card shadow-ride-sm">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent"
        />
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">
            Nouveau véhicule
          </CardTitle>
          <CardDescription>
            Formulaire en français avec catalogue local.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddVehicleForm />
        </CardContent>
      </Card>
    </section>
  );
}
