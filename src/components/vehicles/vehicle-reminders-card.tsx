import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateFr } from "@/lib/utils/date";
import type { VehicleReminderSummary } from "@/types/maintenance";

export function VehicleRemindersCard({ summary }: { summary: VehicleReminderSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rappels d&apos;entretien</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="danger">{summary.urgentCount} urgent(s)</Badge>
          <Badge variant="warning">{summary.importantCount} important(s)</Badge>
          <Badge variant="secondary">{summary.normalCount} normal(aux)</Badge>
        </div>

        {summary.items.length === 0 ? (
          <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            Aucun rappel actif. Le véhicule est à jour pour le moment.
          </p>
        ) : (
          summary.items.map((item) => (
            <div key={item.id} className="rounded-lg border bg-white p-3">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="font-medium">{item.titre}</p>
                <Badge variant={item.level === "urgent" ? "danger" : item.level === "important" ? "warning" : "secondary"}>
                  {item.statusLabel}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">Catégorie : {item.categorie}</p>
              <p className="text-sm text-slate-600">
                Échéance km : {item.nextDueKm != null ? `${item.nextDueKm.toLocaleString("fr-FR")} km` : "non définie"}
              </p>
              <p className="text-sm text-slate-600">Échéance date : {formatDateFr(item.nextDueDate)}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
