"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import { COURSE_CATEGORIES, COURSE_LEVELS, courseSchema } from "@/lib/validation";
import { createCourseAction } from "@/lib/actions";
import { useActionSubmit } from "./useAction";

// The form edits tags as a comma-separated string, then hands the schema an array.
const formSchema = courseSchema.transform((c) => c); // identity; keeps types in one place
type In = z.input<typeof courseSchema>;
type Out = z.output<typeof courseSchema>;

export function CourseForm() {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<In, unknown, Out>({
    resolver: zodResolver(formSchema),
    defaultValues: { category: "DEVELOPMENT", level: "BEGINNER", price: 50, discountPercent: 0, capacity: 20, tags: [] },
  });
  const { submit, pending, result } = useActionSubmit(createCourseAction, setError);
  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      {result?.ok && <Notice kind="ok">Course created (id {result.data.id}).</Notice>}
      {result && !result.ok && <Notice kind="error">{result.message}</Notice>}
      <Field label="Title" htmlFor="title" error={errors.title?.message}><Input id="title" {...register("title")} /></Field>
      <Field label="Description" htmlFor="description" error={errors.description?.message}><Textarea id="description" {...register("description")} /></Field>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field label="Category" htmlFor="category" error={errors.category?.message}>
          <Select id="category" {...register("category")}>{COURSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
        </Field>
        <Field label="Level" htmlFor="level" error={errors.level?.message}>
          <Select id="level" {...register("level")}>{COURSE_LEVELS.map((c) => <option key={c}>{c}</option>)}</Select>
        </Field>
        <Field label="Location" htmlFor="location" error={errors.location?.message}><Input id="location" {...register("location")} /></Field>
        <Field label="Price (USD, whole)" htmlFor="price" error={errors.price?.message}><Input id="price" type="number" {...register("price")} /></Field>
        <Field label="Discount %" htmlFor="discountPercent" error={errors.discountPercent?.message}><Input id="discountPercent" type="number" {...register("discountPercent")} /></Field>
        <Field label="Capacity" htmlFor="capacity" error={errors.capacity?.message}><Input id="capacity" type="number" {...register("capacity")} /></Field>
        <Field label="Starts at" htmlFor="startsAt" error={errors.startsAt?.message}><Input id="startsAt" type="datetime-local" {...register("startsAt")} /></Field>
        <Field label="Ends at" htmlFor="endsAt" error={errors.endsAt?.message}><Input id="endsAt" type="datetime-local" {...register("endsAt")} /></Field>
      </div>
      <Field label="Tags (comma-separated, max 5)" htmlFor="tags" error={errors.tags?.message as string | undefined}>
        <Input id="tags" {...register("tags", { setValueAs: (v: unknown) => (Array.isArray(v) ? v : String(v ?? "").split(",").map((t) => t.trim()).filter(Boolean)) })} />
      </Field>
      <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create course"}</Button>
    </form>
  );
}
