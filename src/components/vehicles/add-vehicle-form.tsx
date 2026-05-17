"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { fuelOptions } from "@/lib/data/fuel-options";
import { modelCatalog, vehicleCatalog } from "@/lib/data/vehicle-catalog";
import { vehicleFormSchema } from "@/lib/validators/vehicle";
import { PLANS } from "@/lib/billing/plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

async function ensureVehicleQuota(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const [profileRes, countRes] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", userId).maybeSingle(),
    supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("user_id", userId)
  ]);
  const plan = (profileRes.data as { plan?: keyof typeof PLANS } | null)?.plan ?? "free";
  const limit = PLANS[plan]?.vehicleLimit ?? PLANS.free.vehicleLimit;
  const used = countRes.count ?? 0;
  return used < limit;
}

async function getUserPlan(supabase: SupabaseClient, userId: string): Promise<keyof typeof PLANS> {
  const { data } = await supabase
    .from("profiles")
    .select("plan, plan_status")
    .eq("id", userId)
    .maybeSingle();
  const profile = data as { plan?: keyof typeof PLANS; plan_status?: string } | null;
  if (!profile?.plan) return "free";
  if (profile.plan_status && profile.plan_status !== "active") return "free";
  return profile.plan;
}

/**
 * Déclenche la génération du plan IA pour ce véhicule en arrière-plan.
 * Silencieux en cas d'erreur ou de 409 (profil constructeur déjà dispo).
 * Toast de succès quand le plan IA est prêt.
 */
function triggerAiPlanGeneration(vehicleId: string, router: ReturnType<typeof useRouter>) {
  void fetch("/api/maintenance/generate-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vehicleId, force: false })
  })
    .then(async (response) => {
      if (response.status === 409) return;
      if (!response.ok) return;
      const result = (await response.json()) as {
        ok?: boolean;
        templateCount?: number;
        profileName?: string;
        aiCallMade?: boolean;
      };
      if (result.ok) {
        toast.success(
          `Plan d'entretien personnalisé prêt (${result.templateCount ?? 0} tâches)${
            result.aiCallMade ? "" : " — depuis le cache"
          }.`
        );
        router.refresh();
      }
    })
    .catch(() => {
      // Échec silencieux : l'utilisateur a déjà son plan générique de secours
    });
}

export function AddVehicleForm() {
  type VehicleFormInput = z.input<typeof vehicleFormSchema>;
  type VehicleFormOutput = z.output<typeof vehicleFormSchema>;

  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const form = useForm<VehicleFormInput, unknown, VehicleFormOutput>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      category: "voitures",
      marque: "",
      modele: "",
      annee: new Date().getFullYear(),
      date_mise_en_circulation: "",
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

      const quotaOk = await ensureVehicleQuota(supabase, user.id);
      if (!quotaOk) {
        toast.error("Limite de véhicules atteinte. Passez à un plan supérieur.");
        router.push("/vehicules/nouveau");
        router.refresh();
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
        date_mise_en_circulation: values.date_mise_en_circulation || null,
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

      const userPlan = await getUserPlan(supabase, user.id);
      if (userPlan === "premium" || userPlan === "family") {
        toast.info("Génération du plan d'entretien personnalisé en cours…");
        triggerAiPlanGeneration(insertedVehicle.id, router);
      }

      router.push(`/vehicule/${insertedVehicle.id}?tab=historique`);
      router.refresh();
    } catch {
      toast.error("Une erreur inattendue est survenue.");
    }
  };

  const importVehiclePackage = async () => {
    if (!importFile) {
      toast.error("Sélectionnez un fichier JSON RideCloud.");
      return;
    }

    try {
      setImportLoading(true);
      const content = await importFile.text();
      const parsed = JSON.parse(content) as {
        vehicle?: Record<string, unknown>;
        maintenance_entries?: Array<Record<string, unknown>>;
        upcoming_maintenance?: Array<Record<string, unknown>>;
        modifications?: Array<Record<string, unknown>>;
        documents?: Array<Record<string, unknown>>;
        documents_files?: Array<{
          source_document_id?: string;
          file_name?: string;
          mime_type?: string;
          base64?: string;
          size?: number;
        }>;
      };

      if (!parsed.vehicle) {
        toast.error("Fichier invalide : bloc véhicule manquant.");
        return;
      }

      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Session expirée, reconnectez-vous.");
        router.push("/login");
        return;
      }

      const quotaOk = await ensureVehicleQuota(supabase, user.id);
      if (!quotaOk) {
        toast.error("Limite de véhicules atteinte. Passez à un plan supérieur pour importer.");
        router.push("/tarifs");
        return;
      }

      const vehiclePayload = {
        user_id: user.id,
        category: String(parsed.vehicle.category ?? "voitures"),
        marque: String(parsed.vehicle.marque ?? ""),
        modele: String(parsed.vehicle.modele ?? ""),
        annee: Number(parsed.vehicle.annee ?? new Date().getFullYear()),
        kilometrage: Number(parsed.vehicle.kilometrage ?? 0),
        date_mise_en_circulation: parsed.vehicle.date_mise_en_circulation
          ? String(parsed.vehicle.date_mise_en_circulation)
          : null,
        date_achat: parsed.vehicle.date_achat ? String(parsed.vehicle.date_achat) : null,
        carburant: parsed.vehicle.carburant ? String(parsed.vehicle.carburant) : null,
        immatriculation: parsed.vehicle.immatriculation ? String(parsed.vehicle.immatriculation) : null,
        vin: parsed.vehicle.vin ? String(parsed.vehicle.vin) : null,
        surnom: parsed.vehicle.surnom ? String(parsed.vehicle.surnom) : null,
        photo_url: null
      };

      const { data: inserted, error } = await supabase.from("vehicles").insert(vehiclePayload as never).select("id").single();
      if (error) {
        toast.error(`Import véhicule impossible : ${error.message}`);
        return;
      }

      const insertedVehicle = inserted as { id: string } | null;
      if (!insertedVehicle?.id) {
        toast.error("Import interrompu : identifiant véhicule introuvable.");
        return;
      }

      const maintenance = (parsed.maintenance_entries ?? []).map((item) => ({
        user_id: user.id,
        vehicle_id: insertedVehicle.id,
        titre: String(item.titre ?? "Opération"),
        date_entretien: item.date_entretien ? String(item.date_entretien) : new Date().toISOString().slice(0, 10),
        kilometrage: Number(item.kilometrage ?? 0),
        cout: item.cout ? Number(item.cout) : null,
        description: item.description ? String(item.description) : null
      }));
      if (maintenance.length > 0) {
        await supabase.from("maintenance_entries").insert(maintenance as never);
      }

      const upcoming = (parsed.upcoming_maintenance ?? []).map((item) => ({
        user_id: user.id,
        vehicle_id: insertedVehicle.id,
        titre: String(item.titre ?? "Échéance"),
        due_date: item.due_date ? String(item.due_date) : null,
        due_km: item.due_km ? Number(item.due_km) : null,
        niveau_urgence: item.niveau_urgence === "urgent" ? "urgent" : "normal",
        description: item.description ? String(item.description) : null,
        source: item.source === "template" ? "template" : "manual"
      }));
      if (upcoming.length > 0) {
        await supabase.from("upcoming_maintenance").insert(upcoming as never);
      }

      const modifications = (parsed.modifications ?? []).map((item) => ({
        user_id: user.id,
        vehicle_id: insertedVehicle.id,
        titre: String(item.titre ?? "Modification"),
        marque: item.marque ? String(item.marque) : null,
        modele: item.modele ? String(item.modele) : null,
        date_pose: item.date_pose ? String(item.date_pose) : null,
        cout: item.cout ? Number(item.cout) : null,
        facture_url: null
      }));
      if (modifications.length > 0) {
        await supabase.from("modifications").insert(modifications as never);
      }

      const documentsMeta = (parsed.documents ?? []) as Array<Record<string, unknown>>;
      const documentsFiles = (parsed.documents_files ?? []).filter((file) => file.base64);

      const metaBySourceId = new Map(
        documentsMeta
          .filter((item) => item.id)
          .map((item) => [String(item.id), item])
      );

      const documentsToInsert: Array<{
        user_id: string;
        vehicle_id: string;
        nom_fichier: string;
        type_fichier: string;
        url: string;
        taille: number | null;
      }> = [];

      const uploadedSourceIds = new Set<string>();

      for (const file of documentsFiles) {
        try {
          const mimeType = file.mime_type || "application/octet-stream";
          const sourceId = file.source_document_id ? String(file.source_document_id) : "";
          const meta = sourceId ? metaBySourceId.get(sourceId) : undefined;
          const fileName = file.file_name || (meta?.nom_fichier ? String(meta.nom_fichier) : "document-importe.bin");
          const extension = fileName.includes(".") ? fileName.split(".").pop() : "bin";
          const safeExt = String(extension ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
          const storagePath = `${user.id}/${insertedVehicle.id}/documents/${crypto.randomUUID()}.${safeExt}`;

          const fileResponse = await fetch(`data:${mimeType};base64,${file.base64}`);
          const fileBlob = await fileResponse.blob();
          const { error: uploadError } = await supabase.storage.from("ridecloud-files").upload(storagePath, fileBlob, {
            upsert: false,
            contentType: mimeType
          });
          if (uploadError) {
            continue;
          }

          documentsToInsert.push({
            user_id: user.id,
            vehicle_id: insertedVehicle.id,
            nom_fichier: fileName,
            type_fichier: mimeType,
            url: storagePath,
            taille: typeof file.size === "number" ? file.size : fileBlob.size
          });
          if (sourceId) {
            uploadedSourceIds.add(sourceId);
          }
        } catch {
          // Skip malformed embedded files
        }
      }

      for (const item of documentsMeta) {
        const sourceId = item.id ? String(item.id) : "";
        if (sourceId && uploadedSourceIds.has(sourceId)) {
          continue;
        }

        documentsToInsert.push({
          user_id: user.id,
          vehicle_id: insertedVehicle.id,
          nom_fichier: String(item.nom_fichier ?? "Document importé"),
          type_fichier: String(item.type_fichier ?? "Fichier"),
          url: "#",
          taille: Number.isFinite(Number(item.taille)) ? Number(item.taille) : null
        });
      }

      if (documentsToInsert.length > 0) {
        let importedDocumentsCount = 0;
        let failedDocumentsCount = 0;

        for (const documentRow of documentsToInsert) {
          const { error: documentError } = await supabase.from("documents").insert(documentRow as never);
          if (documentError) {
            failedDocumentsCount += 1;
          } else {
            importedDocumentsCount += 1;
          }
        }

        if (failedDocumentsCount > 0) {
          toast.warning(`Import partiel des documents : ${importedDocumentsCount}/${documentsToInsert.length} importé(s).`);
        } else {
          toast.success(`${importedDocumentsCount} document(s) importé(s).`);
        }
      }

      toast.success("Dossier RideCloud importé avec succès.");

      const userPlan = await getUserPlan(supabase, user.id);
      if (userPlan === "premium" || userPlan === "family") {
        toast.info("Génération du plan d'entretien personnalisé en cours…");
        triggerAiPlanGeneration(insertedVehicle.id, router);
      }

      router.push(`/vehicule/${insertedVehicle.id}?tab=historique`);
      router.refresh();
    } catch {
      toast.error("Fichier d'import invalide.");
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-3 rounded-xl border-2 border-blue-200 bg-blue-50 p-4 shadow-sm">
          <div className="space-y-1">
            <p className="text-base font-semibold text-blue-900">Reprise d’un véhicule existant</p>
            <p className="text-sm text-blue-800">Importez un dossier RideCloud (.json) reçu lors d’une vente.</p>
          </div>
          <Input type="file" accept="application/json,.json" onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} />
          <Button type="button" onClick={importVehiclePackage} disabled={importLoading || !importFile} className="w-full sm:w-auto">
            <FileUp className="mr-2 h-4 w-4" />
            {importLoading ? "Import en cours..." : "Importer le dossier"}
          </Button>
        </div>

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
          <FormField control={form.control} name="date_mise_en_circulation" render={({ field }) => (
            <FormItem><FormLabel>Date de mise en circulation</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
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
            <FormItem>
              <FormLabel>Carburant</FormLabel>
              <FormControl>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={field.value ?? ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref}>
                  <option value="">Sélectionnez un carburant</option>
                  {fuelOptions.map((fuel) => (
                    <option key={fuel} value={fuel}>
                      {fuel}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
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
