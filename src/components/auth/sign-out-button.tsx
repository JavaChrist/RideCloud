"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({
  className,
  alwaysShowLabel = false
}: {
  className?: string;
  alwaysShowLabel?: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Vous êtes déconnecté");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Impossible de se déconnecter pour le moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isLoading}
      aria-label="Se déconnecter"
      data-menu-close=""
      className={cn(
        "gap-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        className
      )}
    >
      <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
      <span className={alwaysShowLabel ? undefined : "hidden sm:inline"}>
        {isLoading ? "Déconnexion..." : "Déconnexion"}
      </span>
    </Button>
  );
}
