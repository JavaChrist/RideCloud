import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VehicleCostSummary } from "@/types/maintenance";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(value);
}

export function VehicleCostSummaryCard({ summary }: { summary: VehicleCostSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coûts du véhicule</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-slate-50 p-3">
          <p className="text-sm text-slate-600">Ce mois</p>
          <p className="text-lg font-semibold">{formatCurrency(summary.monthlyCost)}</p>
        </div>
        <div className="rounded-lg border bg-slate-50 p-3">
          <p className="text-sm text-slate-600">Cette année</p>
          <p className="text-lg font-semibold">{formatCurrency(summary.yearlyCost)}</p>
        </div>
        <div className="rounded-lg border bg-slate-50 p-3">
          <p className="text-sm text-slate-600">Total cumulé</p>
          <p className="text-lg font-semibold">{formatCurrency(summary.totalCost)}</p>
        </div>
        <div className="rounded-lg border bg-slate-50 p-3">
          <p className="text-sm text-slate-600">Entretien cumulé</p>
          <p className="text-lg font-semibold">{formatCurrency(summary.maintenanceCost)}</p>
        </div>
        <div className="rounded-lg border bg-slate-50 p-3">
          <p className="text-sm text-slate-600">Modifications cumulées</p>
          <p className="text-lg font-semibold">{formatCurrency(summary.modificationsCost)}</p>
        </div>
        <div className="rounded-lg border bg-slate-50 p-3">
          <p className="text-sm text-slate-600">Coût par km</p>
          <p className="text-lg font-semibold">{formatCurrency(summary.costPerKm)} / km</p>
        </div>
      </CardContent>
    </Card>
  );
}
