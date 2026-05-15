import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VehicleCostSummary } from "@/types/maintenance";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(value);
}

type Tile = { label: string; value: string; suffix?: string };

function KpiTile({ tile }: { tile: Tile }) {
  return (
    <div className="group/kpi relative overflow-hidden rounded-2xl border border-slate-200/80 bg-ride-gradient-card p-4 shadow-ride-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-ride-md">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {tile.label}
      </p>
      <p className="mt-2 font-mono text-xl font-semibold tracking-tight tabular-nums text-slate-900">
        {tile.value}
        {tile.suffix ? (
          <span className="ml-1 text-xs font-medium text-slate-500">{tile.suffix}</span>
        ) : null}
      </p>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-700/30 to-transparent opacity-0 transition-opacity duration-300 group-hover/kpi:opacity-100"
      />
    </div>
  );
}

export function VehicleCostSummaryCard({ summary }: { summary: VehicleCostSummary }) {
  const tiles: Tile[] = [
    { label: "Ce mois", value: formatCurrency(summary.monthlyCost) },
    { label: "Cette année", value: formatCurrency(summary.yearlyCost) },
    { label: "Total cumulé", value: formatCurrency(summary.totalCost) },
    { label: "Entretien cumulé", value: formatCurrency(summary.maintenanceCost) },
    { label: "Modifications cumulées", value: formatCurrency(summary.modificationsCost) },
    { label: "Coût par km", value: formatCurrency(summary.costPerKm), suffix: "/ km" }
  ];

  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white shadow-ride-sm">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <TrendingUp className="h-4 w-4" strokeWidth={2} />
        </div>
        <CardTitle className="text-lg font-semibold tracking-tight">
          Coûts du véhicule
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <KpiTile key={tile.label} tile={tile} />
        ))}
      </CardContent>
    </Card>
  );
}
