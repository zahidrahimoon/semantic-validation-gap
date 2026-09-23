"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import { TICKET_CATEGORIES, TICKET_PRIORITIES, ticketSchema } from "@/lib/validation";
import { createTicketAction } from "@/lib/actions";
import { useActionSubmit } from "./useAction";

type In = z.input<typeof ticketSchema>;
type Out = z.output<typeof ticketSchema>;

export function TicketForm() {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors } } = useForm<In, unknown, Out>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: "", description: "", priority: "MEDIUM", category: "OTHER", bookingRef: "" },
  });
  const { submit, pending, result } = useActionSubmit(async (v: Out) => { const r = await createTicketAction(v); if (r.ok) router.push(`/support/${r.data.id}`); return r; }, setError);
  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      {result && !result.ok && <Notice kind="error">{result.message}</Notice>}
      <Field label="Subject" htmlFor="subject" error={errors.subject?.message}><Input id="subject" {...register("subject")} /></Field>
      <Field label="Description" htmlFor="description" error={errors.description?.message} hint="Read by the AI triage assistant (20–2000 chars)"><Textarea id="description" {...register("description")} /></Field>
      <div className="grid gap-x-4 sm:grid-cols-3">
        <Field label="Priority" htmlFor="priority" error={errors.priority?.message}>
          <Select id="priority" {...register("priority")}>{TICKET_PRIORITIES.map((c) => <option key={c}>{c}</option>)}</Select>
        </Field>
        <Field label="Category" htmlFor="category" error={errors.category?.message}>
          <Select id="category" {...register("category")}>{TICKET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
        </Field>
        <Field label="Booking ref" htmlFor="bookingRef" error={errors.bookingRef?.message} hint="Optional, BK-000000"><Input id="bookingRef" {...register("bookingRef")} /></Field>
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Submitting (AI triage runs on CPU, may take a minute)…" : "Submit ticket"}</Button>
    </form>
  );
}
