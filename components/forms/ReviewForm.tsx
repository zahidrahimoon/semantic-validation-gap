"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import { reviewSchema } from "@/lib/validation";
import { createReviewAction } from "@/lib/actions";
import { useActionSubmit } from "./useAction";

type In = z.input<typeof reviewSchema>;
type Out = z.output<typeof reviewSchema>;

export function ReviewForm({ courseId }: { courseId: string }) {
  const { register, handleSubmit, setError, reset, formState: { errors } } = useForm<In, unknown, Out>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { courseId, rating: 5, title: "", body: "" },
  });
  const { submit, pending, result } = useActionSubmit(async (v: Out) => { const r = await createReviewAction(v); if (r.ok) reset(); return r; }, setError);
  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      {result?.ok && <Notice kind="ok">Review posted.</Notice>}
      {result && !result.ok && <Notice kind="error">{result.message}</Notice>}
      <input type="hidden" {...register("courseId")} />
      <Field label="Rating" htmlFor="rating" error={errors.rating?.message}>
        <Select id="rating" {...register("rating")}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}</Select>
      </Field>
      <Field label="Title" htmlFor="rtitle" error={errors.title?.message}><Input id="rtitle" {...register("title")} /></Field>
      <Field label="Review" htmlFor="body" error={errors.body?.message}><Textarea id="body" {...register("body")} /></Field>
      <Button type="submit" disabled={pending}>{pending ? "Posting…" : "Post review"}</Button>
    </form>
  );
}
