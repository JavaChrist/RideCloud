"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { uploadVehiclePhoto } from "@/lib/vehicles/vehicle-photo";
import { VehiclePhotoField } from "@/components/vehicles/vehicle-photo-field";

interface VehiclePhotoEditorProps {
  vehicleId: string;
  photoUrl: string | null;
  alt: string;
  placeholder: ReactNode;
}

export function VehiclePhotoEditor({ vehicleId, photoUrl, alt, placeholder }: VehiclePhotoEditorProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFileChange = async (next: File | null) => {
    if (!next) return;
    setFile(next);
    setBusy(true);
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

      const result = await uploadVehiclePhoto({
        supabase,
        userId: user.id,
        vehicleId,
        file: next
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Photo du véhicule mise à jour.");
      router.refresh();
    } catch {
      toast.error("Impossible d'envoyer la photo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <VehiclePhotoField
      file={file}
      existingSrc={photoUrl}
      alt={alt}
      busy={busy}
      allowClear={false}
      layout="cover"
      placeholder={placeholder}
      onFileChange={handleFileChange}
    />
  );
}
