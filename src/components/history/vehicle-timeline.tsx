"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateFr } from "@/lib/utils/date";
import type { DocumentItem, MaintenanceEntry, Modification, UpcomingMaintenance } from "@/types/database";

type TimelineItem = {
  id: string;
  type: "entretien" | "a_prevoir" | "modification" | "document";
  title: string;
  date: string | null;
  subtitle: string;
  statusLabel: string;
  statusVariant: "secondary" | "success" | "warning" | "danger" | "outline";
};

function toTimelineItems(input: {
  completed: MaintenanceEntry[];
  upcoming: UpcomingMaintenance[];
  modifications: Modification[];
  documents: DocumentItem[];
}) {
  const completedItems: TimelineItem[] = input.completed.map((item) => ({
    id: `entretien-${item.id}`,
    type: "entretien",
    title: item.titre,
    date: item.date_entretien,
    subtitle: `${item.kilometrage.toLocaleString("fr-FR")} km${item.cout ? ` · ${item.cout} €` : ""}`,
    statusLabel: "Effectué",
    statusVariant: "success"
  }));

  const upcomingItems: TimelineItem[] = input.upcoming.map((item) => ({
    id: `aprevoir-${item.id}`,
    type: "a_prevoir",
    title: item.titre,
    date: item.due_date,
    subtitle: item.due_km ? `Échéance à ${item.due_km.toLocaleString("fr-FR")} km` : "Échéance km non définie",
    statusLabel: item.niveau_urgence === "urgent" ? "Urgent" : "À prévoir",
    statusVariant: item.niveau_urgence === "urgent" ? "danger" : "warning"
  }));

  const modificationItems: TimelineItem[] = input.modifications.map((item) => ({
    id: `modification-${item.id}`,
    type: "modification",
    title: item.titre,
    date: item.date_pose,
    subtitle: `${item.marque ?? "-"} ${item.modele ?? ""}`.trim(),
    statusLabel: "Modification",
    statusVariant: "secondary"
  }));

  const documentItems: TimelineItem[] = input.documents.map((item) => ({
    id: `document-${item.id}`,
    type: "document",
    title: item.nom_fichier,
    date: item.created_at,
    subtitle: item.type_fichier,
    statusLabel: "Document",
    statusVariant: "outline"
  }));

  return [...completedItems, ...upcomingItems, ...modificationItems, ...documentItems].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeB - timeA;
  });
}

export function VehicleTimeline({
  completed,
  upcoming,
  modifications,
  documents
}: {
  completed: MaintenanceEntry[];
  upcoming: UpcomingMaintenance[];
  modifications: Modification[];
  documents: DocumentItem[];
}) {
  const items = toTimelineItems({ completed, upcoming, modifications, documents });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chronologie véhicule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-600">
            Aucun événement pour ce véhicule.
          </p>
        )}
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border bg-white p-3">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <p className="font-medium">{item.title}</p>
              <Badge variant={item.statusVariant}>{item.statusLabel}</Badge>
            </div>
            <p className="text-sm text-slate-600">Date : {formatDateFr(item.date)}</p>
            <p className="text-sm text-slate-600">{item.subtitle}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
