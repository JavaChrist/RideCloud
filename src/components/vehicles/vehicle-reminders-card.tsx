import { BellRing, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateFr } from "@/lib/utils/date";
import type { VehicleReminderSummary } from "@/types/maintenance";

const levelStyles = {
  urgent: {
    container:
      "border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/40 ring-1 ring-red-100",
    indicator: "bg-red-500"
  },
  important: {
    container:
      "border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/40 ring-1 ring-amber-100",
    indicator: "bg-amber-500"
  },
  normal: {
    container:
      "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ring-1 ring-slate-100",
    indicator: "bg-slate-400"
  }
} as const;

export function VehicleRemindersCard({ summary }: { summary: VehicleReminderSummary }) {
  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-ride-sm">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-100">
          <BellRing className="h-4 w-4" strokeWidth={2} />
        </div>
        <CardTitle className="text-lg font-semibold tracking-tight">
          Rappels d&apos;entretien
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="danger">{summary.urgentCount} urgent(s)</Badge>
          <Badge variant="warning">{summary.importantCount} important(s)</Badge>
          <Badge variant="secondary">{summary.normalCount} normal(aux)</Badge>
        </div>

        {summary.items.length === 0 ? (
          <p className="flex items-start gap-2 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/40 p-4 text-sm text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-100">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
            Aucun rappel actif. Le véhicule est à jour pour le moment.
          </p>
        ) : (
          <ul className="space-y-2">
            {summary.items.map((item) => {
              const styles = levelStyles[item.level];
              return (
                <li
                  key={item.id}
                  className={`group/reminder relative overflow-hidden rounded-2xl border p-4 shadow-ride-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-ride-md ${styles.container}`}
                >
                  <span
                    aria-hidden
                    className={`absolute inset-y-3 left-0 w-1 rounded-r-full ${styles.indicator}`}
                  />
                  <div className="ml-2">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-slate-50">{item.titre}</p>
                      <Badge
                        variant={
                          item.level === "urgent"
                            ? "danger"
                            : item.level === "important"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {item.statusLabel}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Catégorie ·{" "}
                      </span>
                      {item.categorie}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Échéance km ·{" "}
                      </span>
                      <span className="font-mono tabular-nums">
                        {item.nextDueKm != null
                          ? `${item.nextDueKm.toLocaleString("fr-FR")} km`
                          : "non définie"}
                      </span>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Échéance date ·{" "}
                      </span>
                      {formatDateFr(item.nextDueDate)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
