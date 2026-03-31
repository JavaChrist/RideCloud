"use client";

import { useState } from "react";
import { DocumentsList } from "@/components/documents/documents-list";
import { HistorySections } from "@/components/history/history-sections";
import { ModificationsList } from "@/components/modifications/modifications-list";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DocumentItem, MaintenanceEntry, Modification, UpcomingMaintenance } from "@/types/database";

type TabValue = "historique" | "modifications" | "documents" | "informations";

interface VehicleDetailTabsProps {
  vehicleId: string;
  completed: MaintenanceEntry[];
  upcoming: UpcomingMaintenance[];
  modifications: Modification[];
  documents: DocumentItem[];
  immatriculation: string | null;
  vin: string | null;
  surnom: string | null;
  carburant: string | null;
}

export function VehicleDetailTabs({
  vehicleId,
  completed,
  upcoming,
  modifications,
  documents,
  immatriculation,
  vin,
  surnom,
  carburant
}: VehicleDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("historique");

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-full">
      <div className="md:hidden">
        <select
          value={activeTab}
          onChange={(event) => setActiveTab(event.target.value as TabValue)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="historique">Historique</option>
          <option value="modifications">Modifications</option>
          <option value="documents">Documents</option>
          <option value="informations">Informations</option>
        </select>
      </div>

      <TabsList className="hidden w-full justify-start md:inline-flex">
        <TabsTrigger value="historique">Historique</TabsTrigger>
        <TabsTrigger value="modifications">Modifications</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="informations">Informations</TabsTrigger>
      </TabsList>

      <TabsContent value="historique">
        <HistorySections vehicleId={vehicleId} completed={completed} upcoming={upcoming} />
      </TabsContent>
      <TabsContent value="modifications">
        <ModificationsList vehicleId={vehicleId} items={modifications} />
      </TabsContent>
      <TabsContent value="documents">
        <DocumentsList vehicleId={vehicleId} items={documents} />
      </TabsContent>
      <TabsContent value="informations">
        <Card>
          <CardContent className="space-y-2 p-4 text-sm text-slate-700">
            <p>Immatriculation : {immatriculation ?? "-"}</p>
            <p>VIN : {vin ?? "-"}</p>
            <p>Surnom : {surnom ?? "-"}</p>
            <p>Carburant : {carburant ?? "-"}</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
