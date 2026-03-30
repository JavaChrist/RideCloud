import { z } from "zod";

export const vehicleFormSchema = z.object({
  category: z.enum(["voitures", "motos", "scooters", "utilitaires"]),
  marque: z.string().min(1, "La marque est requise"),
  modele: z.string().min(1, "Le modèle est requis"),
  annee: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  date_achat: z.string().optional(),
  kilometrage: z.coerce.number().int().min(0),
  carburant: z.string().optional(),
  immatriculation: z.string().optional(),
  vin: z.string().optional(),
  surnom: z.string().optional()
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
