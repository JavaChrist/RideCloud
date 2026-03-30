import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDateFr(date: string | null) {
  if (!date) return "-";
  return format(new Date(date), "dd MMM yyyy", { locale: fr });
}
