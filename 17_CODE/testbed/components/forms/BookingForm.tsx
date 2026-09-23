"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Field, Input, Notice, Textarea } from "@/components/ui";
import { bookingSchema } from "@/lib/validation";
import { createBookingAction } from "@/lib/actions";
import { useActionSubmit } from "./useAction";

type In = z.input<typeof bookingSchema>;
type Out = z.output<typeof bookingSchema>;

export function BookingForm({ courseId, remaining }: { courseId: string; remaining: number }) {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<In, unknown, Out>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { courseId, seats: 1, attendeeName: "", attendeeEmail: "", promoCode: "", notes: "" },
  });
  const { submit, pending, result } = useActionSubmit(createBookingAction, setError);
  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      {result?.ok && <Notice kind="ok">Booked. Reference {result.data.ref}, total ${result.data.totalPrice}.</Notice>}
      {result && !result.ok && <Notice kind="error">{result.message}</Notice>}
      <input type="hidden" {...register("courseId")} />
      <Field label={`Seats (${remaining} left)`} htmlFor="seats" error={errors.seats?.message}><Input id="seats" type="number" {...register("seats")} /></Field>
      <Field label="Attendee name" htmlFor="attendeeName" error={errors.attendeeName?.message}><Input id="attendeeName" {...register("attendeeName")} /></Field>
      <Field label="Attendee email" htmlFor="attendeeEmail" error={errors.attendeeEmail?.message}><Input id="attendeeEmail" type="email" {...register("attendeeEmail")} /></Field>
      <Field label="Promo code" htmlFor="promoCode" error={errors.promoCode?.message} hint="Optional, e.g. WELCOME10"><Input id="promoCode" {...register("promoCode")} /></Field>
      <Field label="Special requirements" htmlFor="notes" error={errors.notes?.message} hint="Dietary, accessibility, etc. (max 500)"><Textarea id="notes" {...register("notes")} /></Field>
      <Button type="submit" disabled={pending || remaining < 1}>{pending ? "Booking…" : "Book seats"}</Button>
    </form>
  );
}
