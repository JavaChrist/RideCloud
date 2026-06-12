"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  claimFounderSlot,
  getFounderRecord,
  getSlotsTaken,
  submitQuestionnaire,
  effectiveStatus,
  daysLeft,
  questionnaireDeadline,
  FOUNDER_LIMIT,
  QUESTIONNAIRE_WINDOW_DAYS,
  REMINDER_DAY,
  type FounderRecord,
  type FounderStatus,
  type QuestionnaireAnswers
} from "@/lib/billing/founder-program";

interface UseFounderProgramState {
  loading: boolean;
  record: FounderRecord | null;
  slotsTaken: number;
  slotsRemaining: number;
  status: FounderStatus | null;
  deadline: Date | null;
  daysRemaining: number | null;
  error: string | null;
  claiming: boolean;
  submitting: boolean;
}

interface UseFounderProgramApi extends UseFounderProgramState {
  claim: () => Promise<{ ok: boolean; slot?: number; alreadyMember?: boolean; reason?: "program_full" }>;
  submit: (
    answers: QuestionnaireAnswers
  ) => Promise<{ ok: boolean; reason?: "no_slot" | "expired" | "already_done" }>;
  refresh: () => Promise<void>;
}

/**
 * Hook React qui expose l'état du programme Fondateurs pour l'utilisateur
 * authentifié courant. Toute la logique sensible vit côté Postgres via les
 * RPC ; ce hook ne fait que les appeler et garder un état local synchrone.
 */
export function useFounderProgram(): UseFounderProgramApi {
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<FounderRecord | null>(null);
  const [slotsTaken, setSlotsTaken] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const [recordRes, countRes] = await Promise.all([
        getFounderRecord(supabase),
        getSlotsTaken(supabase)
      ]);
      setRecord(recordRes);
      setSlotsTaken(countRes);
    } catch (err) {
      console.error("[use-founder-program] refresh error", err);
      setError("Impossible de charger les informations du programme.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const claim = useCallback<UseFounderProgramApi["claim"]>(async () => {
    setClaiming(true);
    setError(null);
    try {
      const supabase = createClient();
      const result = await claimFounderSlot(supabase);
      if (result.ok) {
        await refresh();
        return { ok: true, slot: result.slot, alreadyMember: result.alreadyMember };
      }
      return { ok: false, reason: result.reason };
    } catch (err) {
      console.error("[use-founder-program] claim error", err);
      setError("Impossible de réserver votre place pour le moment.");
      return { ok: false };
    } finally {
      setClaiming(false);
    }
  }, [refresh]);

  const submit = useCallback<UseFounderProgramApi["submit"]>(
    async (answers) => {
      setSubmitting(true);
      setError(null);
      try {
        const supabase = createClient();
        const result = await submitQuestionnaire(supabase, answers);
        if (result.ok) {
          await refresh();
          return { ok: true };
        }
        return { ok: false, reason: result.reason };
      } catch (err) {
        console.error("[use-founder-program] submit error", err);
        setError("Impossible d'enregistrer votre réponse pour le moment.");
        return { ok: false };
      } finally {
        setSubmitting(false);
      }
    },
    [refresh]
  );

  const status = record ? effectiveStatus(record) : null;
  const deadline = record ? questionnaireDeadline(record.joinedAt) : null;
  const daysRemaining = record ? daysLeft(record.joinedAt) : null;
  const slotsRemaining = Math.max(0, FOUNDER_LIMIT - slotsTaken);

  return {
    loading,
    record,
    slotsTaken,
    slotsRemaining,
    status,
    deadline,
    daysRemaining,
    error,
    claiming,
    submitting,
    claim,
    submit,
    refresh
  };
}

// Re-exports pour les composants qui consomment uniquement le hook
export { FOUNDER_LIMIT, QUESTIONNAIRE_WINDOW_DAYS, REMINDER_DAY };
export type { FounderRecord, FounderStatus, QuestionnaireAnswers };
