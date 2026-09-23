"use client";
/** Shared glue: submit RHF values to a server action, map returned field errors back onto the form. */
import { useState } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ActionResult } from "@/lib/validation";

export function useActionSubmit<TValues extends FieldValues, TData>(
  action: (input: TValues) => Promise<ActionResult<TData>>,
  setError: UseFormSetError<TValues>
) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ActionResult<TData> | null>(null);
  async function submit(values: TValues) {
    setPending(true);
    setResult(null);
    try {
      const r = await action(values);
      setResult(r);
      if (!r.ok && r.errors) {
        for (const [field, msgs] of Object.entries(r.errors)) setError(field as Path<TValues>, { message: msgs.join("; ") });
      }
    } finally {
      setPending(false);
    }
  }
  return { submit, pending, result };
}
