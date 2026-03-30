import { AddVehicleForm } from "@/components/vehicles/add-vehicle-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewVehiclePage() {
  return (
    <section className="space-y-6">
      <div><h1 className="text-3xl font-semibold tracking-tight">Ajouter un véhicule</h1><p className="text-slate-600">Créez une fiche complète avec les informations de base.</p></div>
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Nouveau véhicule</CardTitle><CardDescription>Formulaire en français avec catalogue local.</CardDescription></CardHeader>
        <CardContent><AddVehicleForm /></CardContent>
      </Card>
    </section>
  );
}
