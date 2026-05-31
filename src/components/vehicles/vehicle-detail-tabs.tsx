"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  History,
  Info,
  Wrench,
  type LucideIcon
} from "lucide-react";
import { DocumentsList } from "@/components/documents/documents-list";
import { HistorySections } from "@/components/history/history-sections";
import { MaintenancePlanList } from "@/components/history/maintenance-plan-list";
import { VehicleTimeline } from "@/components/history/vehicle-timeline";
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

type TabValue = "historique" | "chronologie" | "plan-entretien" | "modifications" | "documents" | "informations";

interface TabItem {
  value: TabValue;
  label: string;
  icon: LucideIcon;
}

const TAB_ITEMS: TabItem[] = [
  { value: "historique", label: "Historique", icon: History },
  { value: "chronologie", label: "Chronologie", icon: CalendarClock },
  { value: "plan-entretien", label: "Plan d'entretien", icon: ClipboardList },
  { value: "modifications", label: "Modifications", icon: Wrench },
  { value: "documents", label: "Documents", icon: FileText },
  { value: "informations", label: "Informations", icon: Info }
];

function MobileTabSelect({
  value,
  onValueChange
}: {
  value: TabValue;
  onValueChange: (value: TabValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeItem = TAB_ITEMS.find((item) => item.value === value) ?? TAB_ITEMS[0];
  const ActiveIcon = activeItem.icon;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  const handleSelect = (next: TabValue) => {
    onValueChange(next);
    close();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 text-sm font-medium text-foreground shadow-ride-sm transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="flex items-center gap-2.5">
          <ActiveIcon className="h-4 w-4 text-primary" aria-hidden="true" />
          {activeItem.label}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Sélectionner une section"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-ride-lg"
        >
          {TAB_ITEMS.map((item) => {
            const ItemIcon = item.icon;
            const isActive = item.value === value;

            return (
              <li key={item.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => handleSelect(item.value)}
                  className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-foreground hover:bg-accent/60"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <ItemIcon
                      className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                      aria-hidden="true"
                    />
                    {item.label}
                  </span>
                  {isActive && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface VehicleDetailTabsProps {
  vehicleId: string;
  completed: MaintenanceEntry[];
  upcoming: UpcomingMaintenance[];
  planEntries: MaintenancePlanEntry[];
  maintenanceProfileName: string;
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
  canUseAi?: boolean;
  userPlan?: string;
}

export function VehicleDetailTabs({
  vehicleId,
  completed,
  upcoming,
  planEntries,
  maintenanceProfileName,
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
  carburant,
  canUseAi = false,
  userPlan = "free"
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
        <MobileTabSelect value={activeTab} onValueChange={setActiveTab} />
      </div>

      <TabsList className="hidden w-full justify-start md:inline-flex">
        <TabsTrigger value="historique">Historique</TabsTrigger>
        <TabsTrigger value="chronologie">Chronologie</TabsTrigger>
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
      <TabsContent value="chronologie">
        <VehicleTimeline
          completed={completed}
          upcoming={upcoming}
          modifications={modifications}
          documents={documents}
        />
      </TabsContent>
      <TabsContent value="plan-entretien">
        <MaintenancePlanList
          vehicleId={vehicleId}
          currentKm={kilometrage}
          items={planEntries}
          maintenanceProfileName={maintenanceProfileName}
          canUseAi={canUseAi}
          userPlan={userPlan}
        />
      </TabsContent>
      <TabsContent value="modifications">
        <ModificationsList vehicleId={vehicleId} items={modifications} />
      </TabsContent>
      <TabsContent value="documents">
        <DocumentsList vehicleId={vehicleId} items={documents} />
      </TabsContent>
      <TabsContent value="informations">
        <Card>
          <CardContent className="space-y-4 p-4 text-sm text-slate-700 dark:text-slate-200">
            {!isUuidVehicle && (
              <p className="rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-2 text-sm text-amber-800 dark:text-amber-300">
                Véhicule de démonstration : les modifications sont désactivées.
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Type de véhicule</p>
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
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Marque</p>
                <Input
                  value={infoForm.marque}
                  onChange={(event) => setInfoForm((state) => ({ ...state, marque: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Modèle</p>
                <Input
                  value={infoForm.modele}
                  onChange={(event) => setInfoForm((state) => ({ ...state, modele: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Année</p>
                <Input
                  type="number"
                  value={infoForm.annee}
                  onChange={(event) => setInfoForm((state) => ({ ...state, annee: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Kilométrage actuel</p>
                <Input
                  type="number"
                  value={infoForm.kilometrage}
                  onChange={(event) => setInfoForm((state) => ({ ...state, kilometrage: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Date de mise en circulation</p>
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
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Date d&apos;achat</p>
                <Input
                  type="date"
                  value={infoForm.date_achat}
                  onChange={(event) => setInfoForm((state) => ({ ...state, date_achat: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Immatriculation</p>
                <Input
                  value={infoForm.immatriculation}
                  onChange={(event) => setInfoForm((state) => ({ ...state, immatriculation: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">VIN</p>
                <Input
                  value={infoForm.vin}
                  onChange={(event) => setInfoForm((state) => ({ ...state, vin: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Surnom</p>
                <Input
                  value={infoForm.surnom}
                  onChange={(event) => setInfoForm((state) => ({ ...state, surnom: event.target.value }))}
                  disabled={!isUuidVehicle}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Carburant</p>
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
