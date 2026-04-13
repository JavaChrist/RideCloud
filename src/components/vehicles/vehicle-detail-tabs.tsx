"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentsList } from "@/components/documents/documents-list";
import { HistorySections } from "@/components/history/history-sections";
import { MaintenancePlanList } from "@/components/history/maintenance-plan-list";
import { ModificationsList } from "@/components/modifications/modifications-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fuelOptions } from "@/lib/data/fuel-options";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type {
  DocumentItem,
  MaintenanceEntry,
  MaintenancePlanEntry,
  Modification,
  UpcomingMaintenance,
  VehicleCategory
} from "@/types/database";

type TabValue = "historique" | "plan-entretien" | "modifications" | "documents" | "informations";

interface VehicleDetailTabsProps {
  vehicleId: string;
  completed: MaintenanceEntry[];
  upcoming: UpcomingMaintenance[];
  planEntries: MaintenancePlanEntry[];
  modifications: Modification[];
  documents: DocumentItem[];
  category: VehicleCategory;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  dateMiseEnCirculation: string | null;
  dateAchat: string | null;
  immatriculation: string | null;
  vin: string | null;
  surnom: string | null;
  carburant: string | null;
}

export function VehicleDetailTabs({
  vehicleId,
  completed,
  upcoming,
  planEntries,
  modifications,
  documents,
  category,
  marque,
  modele,
  annee,
  kilometrage,
  dateMiseEnCirculation,
  dateAchat,
  immatriculation,
  vin,
  surnom,
  carburant
}: VehicleDetailTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>("historique");
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    category,
    marque,
    modele,
    annee: String(annee),
    kilometrage: String(kilometrage),
    date_mise_en_circulation: dateMiseEnCirculation ?? "",
    date_achat: dateAchat ?? "",
    immatriculation: immatriculation ?? "",
    vin: vin ?? "",
    surnom: surnom ?? "",
    carburant: carburant ?? ""
  });

  const isUuidVehicle = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(vehicleId);

  const saveInformations = async () => {
    if (!isUuidVehicle) {
      toast.error("Modification impossible sur véhicule démo.");
      return;
    }

    const parsedAnnee = Number(infoForm.annee);
    const parsedKilometrage = Number(infoForm.kilometrage);
    if (!infoForm.marque.trim() || !infoForm.modele.trim()) {
      toast.error("La marque et le modèle sont requis.");
      return;
    }
    if (!Number.isFinite(parsedAnnee) || !Number.isFinite(parsedKilometrage)) {
      toast.error("Année et kilométrage doivent être valides.");
      return;
    }

    try {
      setIsSavingInfo(true);
      const supabase = createClient();
      const payload = {
        category: infoForm.category,
        marque: infoForm.marque.trim(),
        modele: infoForm.modele.trim(),
        annee: parsedAnnee,
        kilometrage: parsedKilometrage,
        date_mise_en_circulation: infoForm.date_mise_en_circulation || null,
        date_achat: infoForm.date_achat || null,
        immatriculation: infoForm.immatriculation || null,
        vin: infoForm.vin || null,
        surnom: infoForm.surnom || null,
        carburant: infoForm.carburant || null
      };

      const { error } = await supabase.from("vehicles").update(payload as never).eq("id", vehicleId);
      if (error) {
        toast.error(`Enregistrement impossible: ${error.message}`);
        return;
      }

      toast.success("Informations véhicule mises à jour.");
      router.refresh();
    } finally {
      setIsSavingInfo(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-full">
      <div className="md:hidden">
        <select
          value={activeTab}
          onChange={(event) => setActiveTab(event.target.value as TabValue)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="historique">Historique</option>
          <option value="plan-entretien">Plan d&apos;entretien</option>
          <option value="modifications">Modifications</option>
          <option value="documents">Documents</option>
          <option value="informations">Informations</option>
        </select>
      </div>

      <TabsList className="hidden w-full justify-start md:inline-flex">
        <TabsTrigger value="historique">Historique</TabsTrigger>
        <TabsTrigger value="plan-entretien">Plan d&apos;entretien</TabsTrigger>
        <TabsTrigger value="modifications">Modifications</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="informations">Informations</TabsTrigger>
      </TabsList>

      <TabsContent value="historique">
        <HistorySections
          vehicleId={vehicleId}
          completed={completed}
          upcoming={upcoming}
          planEntries={planEntries}
          currentKm={kilometrage}
        />
      </TabsContent>
      <TabsContent value="plan-entretien">
        <MaintenancePlanList vehicleId={vehicleId} currentKm={kilometrage} items={planEntries} />
      </TabsContent>
      <TabsContent value="modifications">
        <ModificationsList vehicleId={vehicleId} items={modifications} />
      </TabsContent>
      <TabsContent value="documents">
        <DocumentsList vehicleId={vehicleId} items={documents} />
      </TabsContent>
      <TabsContent value="informations">
        <Card>
          <CardContent className="space-y-4 p-4 text-sm text-slate-700">
            {!isUuidVehicle && (
              <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">
                Véhicule de démonstration : les modifications sont désactivées.
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Type de véhicule</p>
                <select
                  value={infoForm.category}
                  onChange={(event) => setInfoForm((state) => ({ ...state, category: event.target.value as VehicleCategory }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={!isUuidVehicle}
                >
                  <option value="voitures">Voitures</option>
                  <option value="motos">Motos</option>
                  <option value="scooters">Scooters</option>
                  <option value="utilitaires">Utilitaires</option>
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Marque</p>
                <Input
                  value={infoForm.marque}
                  onChange={(event) => setInfoForm((state) => ({ ...state, marque: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Modèle</p>
                <Input
                  value={infoForm.modele}
                  onChange={(event) => setInfoForm((state) => ({ ...state, modele: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Année</p>
                <Input
                  type="number"
                  value={infoForm.annee}
                  onChange={(event) => setInfoForm((state) => ({ ...state, annee: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Kilométrage actuel</p>
                <Input
                  type="number"
                  value={infoForm.kilometrage}
                  onChange={(event) => setInfoForm((state) => ({ ...state, kilometrage: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Date de mise en circulation</p>
                <Input
                  type="date"
                  value={infoForm.date_mise_en_circulation}
                  onChange={(event) =>
                    setInfoForm((state) => ({ ...state, date_mise_en_circulation: event.target.value }))
                  }
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Date d&apos;achat</p>
                <Input
                  type="date"
                  value={infoForm.date_achat}
                  onChange={(event) => setInfoForm((state) => ({ ...state, date_achat: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Immatriculation</p>
                <Input
                  value={infoForm.immatriculation}
                  onChange={(event) => setInfoForm((state) => ({ ...state, immatriculation: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">VIN</p>
                <Input
                  value={infoForm.vin}
                  onChange={(event) => setInfoForm((state) => ({ ...state, vin: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Surnom</p>
                <Input
                  value={infoForm.surnom}
                  onChange={(event) => setInfoForm((state) => ({ ...state, surnom: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Carburant</p>
                <select
                  value={infoForm.carburant}
                  onChange={(event) => setInfoForm((state) => ({ ...state, carburant: event.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={!isUuidVehicle}
                >
                  <option value="">Sélectionnez un carburant</option>
                  {fuelOptions.map((fuel) => (
                    <option key={fuel} value={fuel}>
                      {fuel}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={saveInformations} disabled={!isUuidVehicle || isSavingInfo}>
              {isSavingInfo ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
