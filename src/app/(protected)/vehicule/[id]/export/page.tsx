import { redirect } from "next/navigation";
import { PrintExportButton } from "@/components/vehicles/print-export-button";
import { createClient } from "@/lib/supabase/server";
import { formatDateFr } from "@/lib/utils/date";
import { getVehicleById, getVehicleHistory } from "@/lib/data/vehicle-repository";

export default async function VehicleExportPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const vehicle = await getVehicleById(user.id, id);
  if (!vehicle) {
    return <div className="p-6">Véhicule introuvable.</div>;
  }

  const { completed, upcoming, modifications, documents } = await getVehicleHistory(user.id, vehicle.id);

  return (
    <main className="mx-auto max-w-4xl space-y-6 bg-white p-6 text-slate-900 print:max-w-none print:p-0">
      <header className="space-y-2 border-b pb-4">
        <h1 className="text-2xl font-semibold">Dossier de cession véhicule</h1>
        <p className="text-sm text-slate-600">Export RideCloud généré le {formatDateFr(new Date().toISOString())}</p>
        <PrintExportButton />
      </header>

      <section className="space-y-1">
        <h2 className="text-xl font-semibold">Identité du véhicule</h2>
        <p>Marque / Modèle : {vehicle.marque} {vehicle.modele}</p>
        <p>Année : {vehicle.annee}</p>
        <p>Kilométrage : {vehicle.kilometrage.toLocaleString("fr-FR")} km</p>
        <p>Immatriculation : {vehicle.immatriculation ?? "-"}</p>
        <p>VIN : {vehicle.vin ?? "-"}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Historique - Déjà effectué</h2>
        {completed.length === 0 ? (
          <p className="text-sm text-slate-600">Aucune donnée.</p>
        ) : (
          completed.map((item) => (
            <div key={item.id} className="rounded-md border p-3">
              <p className="font-medium">{item.titre}</p>
              <p className="text-sm">Date : {formatDateFr(item.date_entretien)} - {item.kilometrage.toLocaleString("fr-FR")} km</p>
              <p className="text-sm">Coût : {item.cout ? `${item.cout} €` : "-"}</p>
              {item.description && <p className="text-sm">{item.description}</p>}
            </div>
          ))
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Historique - À prévoir</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-600">Aucune donnée.</p>
        ) : (
          upcoming.map((item) => (
            <div key={item.id} className="rounded-md border p-3">
              <p className="font-medium">{item.titre}</p>
              <p className="text-sm">Date cible : {item.due_date ? formatDateFr(item.due_date) : "-"}</p>
              <p className="text-sm">Échéance km : {item.due_km ? `${item.due_km.toLocaleString("fr-FR")} km` : "-"}</p>
              <p className="text-sm">Urgence : {item.niveau_urgence}</p>
              {item.description && <p className="text-sm">{item.description}</p>}
            </div>
          ))
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Modifications</h2>
        {modifications.length === 0 ? (
          <p className="text-sm text-slate-600">Aucune donnée.</p>
        ) : (
          modifications.map((item) => (
            <div key={item.id} className="rounded-md border p-3">
              <p className="font-medium">{item.titre}</p>
              <p className="text-sm">Marque : {item.marque ?? "-"} - Modèle : {item.modele ?? "-"}</p>
              <p className="text-sm">Date de pose : {formatDateFr(item.date_pose)} - Coût : {item.cout ? `${item.cout} €` : "-"}</p>
            </div>
          ))
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Documents</h2>
        {documents.length === 0 ? (
          <p className="text-sm text-slate-600">Aucune donnée.</p>
        ) : (
          documents.map((item) => (
            <div key={item.id} className="rounded-md border p-3">
              <p className="font-medium">{item.nom_fichier}</p>
              <p className="text-sm">Type : {item.type_fichier}</p>
              <p className="text-sm">Ajouté le : {formatDateFr(item.created_at)}</p>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
