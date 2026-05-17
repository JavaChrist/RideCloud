"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmVariant = "info" | "warning" | "danger" | "success" | "ai";

export interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  hideCancel?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

const VARIANT_STYLES: Record<
  ConfirmVariant,
  {
    icon: typeof AlertTriangle;
    iconWrap: string;
    accent: string;
    confirmClass: string;
    titleClass: string;
  }
> = {
  info: {
    icon: Info,
    iconWrap: "border-blue-200 bg-blue-50 text-blue-700",
    accent: "from-blue-50 via-white to-white",
    confirmClass:
      "bg-blue-700 text-white hover:bg-blue-800 shadow-[0_4px_14px_-4px_rgba(29,78,216,0.5)]",
    titleClass: "text-slate-900"
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: "border-amber-200 bg-amber-50 text-amber-700",
    accent: "from-amber-50 via-white to-white",
    confirmClass:
      "bg-amber-600 text-white hover:bg-amber-700 shadow-[0_4px_14px_-4px_rgba(217,119,6,0.55)]",
    titleClass: "text-slate-900"
  },
  danger: {
    icon: ShieldAlert,
    iconWrap: "border-rose-200 bg-rose-50 text-rose-700",
    accent: "from-rose-50 via-white to-white",
    confirmClass:
      "bg-rose-600 text-white hover:bg-rose-700 shadow-[0_4px_14px_-4px_rgba(225,29,72,0.55)]",
    titleClass: "text-slate-900"
  },
  success: {
    icon: CheckCircle2,
    iconWrap: "border-emerald-200 bg-emerald-50 text-emerald-700",
    accent: "from-emerald-50 via-white to-white",
    confirmClass:
      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_4px_14px_-4px_rgba(5,150,105,0.55)]",
    titleClass: "text-slate-900"
  },
  ai: {
    icon: Sparkles,
    iconWrap: "border-violet-200 bg-violet-50 text-violet-700",
    accent: "from-violet-50 via-white to-white",
    confirmClass:
      "bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-[0_4px_14px_-4px_rgba(124,58,237,0.55)]",
    titleClass: "text-slate-900"
  }
};

interface InternalState extends ConfirmOptions {
  open: boolean;
}

const DEFAULT_STATE: InternalState = {
  open: false,
  title: "",
  description: "",
  variant: "info"
};

/**
 * Provider à monter haut dans l'arbre (root layout ou layout protected).
 * Expose un hook `useConfirm()` qui renvoie une fonction `confirm(opts)`
 * retournant une Promise<boolean>. Remplace les `window.confirm()` natifs
 * par une modale stylée, accessible et cohérente avec le design system.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InternalState>(DEFAULT_STATE);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({ ...options, open: true });
    });
  }, []);

  const handleClose = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  const variant = state.variant ?? "info";
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.icon;

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Dialog
        open={state.open}
        onOpenChange={(open) => {
          if (!open) handleClose(false);
        }}
      >
        <DialogContent className="overflow-hidden p-0">
          <div
            className={cn(
              "relative bg-gradient-to-b px-6 pb-6 pt-6",
              styles.accent
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/40 to-transparent"
            />
            <DialogHeader className="!p-0">
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
                    styles.iconWrap
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.2} aria-hidden />
                </span>
                <DialogTitle className={cn("text-lg", styles.titleClass)}>
                  {state.title || "Confirmation"}
                </DialogTitle>
              </div>
              {state.description ? (
                <DialogDescription className="whitespace-pre-line">
                  {state.description}
                </DialogDescription>
              ) : null}
            </DialogHeader>
          </div>
          <DialogFooter>
            {!state.hideCancel && (
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                {state.cancelText ?? "Annuler"}
              </Button>
            )}
            <Button
              autoFocus
              onClick={() => handleClose(true)}
              className={cn(styles.confirmClass)}
            >
              {state.confirmText ?? "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error(
      "useConfirm doit être appelé à l'intérieur d'un <ConfirmProvider />."
    );
  }
  return ctx.confirm;
}

// Re-export utilitaire au cas où d'autres composants veulent l'icône d'aide
export { HelpCircle };
