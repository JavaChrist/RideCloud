"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { modelCatalog, vehicleCatalog } from "@/lib/data/vehicle-catalog";
import { vehicleFormSchema } from "@/lib/validators/vehicle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function AddVehicleForm() {
  type VehicleFormInput = z.input<typeof vehicleFormSchema>;
  type VehicleFormOutput = z.output<typeof vehicleFormSchema>;

  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const form = useForm<VehicleFormInput, unknown, VehicleFormOutput>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      category: "voitures",
      marque: "",
      modele: "",
      annee: new Date().getFullYear(),
      date_achat: "",
      kilometrage: 0,
      carburant: "",
      immatriculation: "",
      vin: "",
      surnom: ""
    }
  });

  const category = form.watch("category");
  const marque = form.watch("marque");
  const brands = useMemo(() => vehicleCatalog[category], [category]);
  const models = useMemo(() => modelCatalog[marque] ?? [], [marque]);

  const onSubmit = async (values: VehicleFormOutput) => {
    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Session expirée, reconnectez-vous.");
        router.push("/login");
        return;
      }

      if (photoFile && !photoFile.type.startsWith("image/")) {
        toast.error("Le fichier doit être une image valide.");
        return;
      }

      if (photoFile && photoFile.size > 8 * 1024 * 1024) {
        toast.error("La photo est trop lourde (max 8 Mo).");
        return;
      }

      const payload = {
        user_id: user.id,
        category: values.category,
        marque: values.marque,
        modele: values.modele,
        annee: values.annee,
        kilometrage: values.kilometrage,
        date_achat: values.date_achat || null,
        carburant: values.category === "voitures" ? values.carburant || null : null,
        immatriculation: values.immatriculation || null,
        vin: values.vin || null,
        surnom: values.surnom || null,
        photo_url: null
      };

      const { data: inserted, error } = await supabase
        .from("vehicles")
        .insert(payload as never)
        .select("id, category")
        .single();

      if (error) {
        if (error.code === "PGRST205" || error.message.toLowerCase().includes("relation")) {
          toast.error("Table Supabase introuvable. Exécutez le script SQL `supabase/schema.sql`.");
        } else {
          toast.error(`Impossible d'enregistrer le véhicule: ${error.message}`);
        }
        return;
      }

      const insertedVehicle = inserted as { id: string } | null;
      if (!insertedVehicle?.id) {
        toast.error("Véhicule créé mais identifiant introuvable.");
        router.push("/categories");
        router.refresh();
        return;
      }

      if (photoFile) {
        const extension = photoFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
        const fileName = `${insertedVehicle.id}.${safeExtension}`;
        const photoPath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("ridecloud-files").upload(photoPath, photoFile, {
          upsert: true
        });

        if (uploadError) {
          toast.warning(`Véhicule créé, mais photo non téléversée: ${uploadError.message}`);
        } else {
          const { error: updateError } = await supabase
            .from("vehicles")
            .update({ photo_url: photoPath } as never)
            .eq("id", insertedVehicle.id)
            .eq("user_id", user.id);

          if (updateError) {
            toast.warning("Photo envoyée, mais lien non enregistré sur le véhicule.");
          }
        }
      }

      toast.success("Véhicule enregistré avec succès.");
      router.push(`/vehicule/${insertedVehicle.id}?tab=historique`);
      router.refresh();
    } catch {
      toast.error("Une erreur inattendue est survenue.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem><FormLabel>Type de véhicule</FormLabel><FormControl><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...field}><option value="voitures">Voitures</option><option value="motos">Motos</option><option value="scooters">Scooters</option><option value="utilitaires">Utilitaires</option></select></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="marque" render={({ field }) => (
            <FormItem>
              <FormLabel>Marque</FormLabel>
              <FormControl>
                <Input list={`brands-${category}`} placeholder="Sélectionnez ou saisissez une marque" {...field} />
              </FormControl>
              <datalist id={`brands-${category}`}>
                {brands.map((brand) => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="modele" render={({ field }) => (
            <FormItem>
              <FormLabel>Modèle</FormLabel>
              <FormControl>
                <Input list={`models-${marque || "all"}`} placeholder="Sélectionnez ou saisissez un modèle" {...field} />
              </FormControl>
              <datalist id={`models-${marque || "all"}`}>
                {models.map((model) => (
                  <option key={model} value={model} />
                ))}
              </datalist>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="annee" render={({ field }) => (
            <FormItem>
              <FormLabel>Année</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={(field.value as number | undefined) ?? ""}
                  onChange={(event) => field.onChange(event.target.value === "" ? undefined : Number(event.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="date_achat" render={({ field }) => (
            <FormItem><FormLabel>Date d'achat</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="kilometrage" render={({ field }) => (
            <FormItem>
              <FormLabel>Kilométrage actuel</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={(field.value as number | undefined) ?? ""}
                  onChange={(event) => field.onChange(event.target.value === "" ? undefined : Number(event.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          {category === "voitures" && <FormField control={form.control} name="carburant" render={({ field }) => (
            <FormItem><FormLabel>Carburant</FormLabel><FormControl><Input placeholder="Essence, Diesel..." {...field} /></FormControl><FormMessage /></FormItem>
          )} />}
          <FormField control={form.control} name="immatriculation" render={({ field }) => (
            <FormItem><FormLabel>Immatriculation (optionnel)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="vin" render={({ field }) => (
            <FormItem><FormLabel>VIN (optionnel)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="surnom" render={({ field }) => (
            <FormItem><FormLabel>Surnom (optionnel)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormItem>
          <FormLabel>Photo du véhicule</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setPhotoFile(file);
              }}
            />
          </FormControl>
          <FormDescription>Photo stockée dans Supabase Storage.</FormDescription>
        </FormItem>
        <FormItem><FormLabel>Notes (optionnel)</FormLabel><FormControl><Textarea placeholder="Commentaires..." /></FormControl></FormItem>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Enregistrement..." : "Enregistrer le véhicule"}
        </Button>
      </form>
    </Form>
  );
}
