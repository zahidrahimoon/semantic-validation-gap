"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Field, Input, Notice, Select, Textarea } from "@/components/ui";
import { COUNTRIES, profileSchema } from "@/lib/validation";
import { updateProfileAction } from "@/lib/actions";
import { useActionSubmit } from "./useAction";

type In = z.input<typeof profileSchema>;
type Out = z.output<typeof profileSchema>;

export function ProfileForm({ defaults }: { defaults: In }) {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<In, unknown, Out>({ resolver: zodResolver(profileSchema), defaultValues: defaults });
  const { submit, pending, result } = useActionSubmit(updateProfileAction, setError);
  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      {result?.ok && <Notice kind="ok">Profile saved.</Notice>}
      {result && !result.ok && <Notice kind="error">{result.message}</Notice>}
      <Field label="Display name" htmlFor="displayName" error={errors.displayName?.message}>
        <Input id="displayName" {...register("displayName")} />
      </Field>
      <Field label="Username" htmlFor="username" error={errors.username?.message} hint="3–20 lowercase letters, digits, underscore">
        <Input id="username" {...register("username")} />
      </Field>
      <Field label="Bio" htmlFor="bio" error={errors.bio?.message} hint="Shown to the assistant as context (max 300)">
        <Textarea id="bio" {...register("bio")} />
      </Field>
      <Field label="Birth date" htmlFor="birthDate" error={errors.birthDate?.message}>
        <Input id="birthDate" type="date" {...register("birthDate")} />
      </Field>
      <Field label="Website" htmlFor="website" error={errors.website?.message}>
        <Input id="website" placeholder="https://" {...register("website")} />
      </Field>
      <Field label="Country" htmlFor="country" error={errors.country?.message}>
        <Select id="country" {...register("country")}>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </Field>
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</Button>
    </form>
  );
}
