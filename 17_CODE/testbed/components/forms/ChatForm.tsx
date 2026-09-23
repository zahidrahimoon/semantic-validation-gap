"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Field, Notice, Textarea } from "@/components/ui";
import { chatSchema } from "@/lib/validation";
import { sendChatAction } from "@/lib/actions";
import { useActionSubmit } from "./useAction";

type In = z.input<typeof chatSchema>;
type Out = z.output<typeof chatSchema>;

export function ChatForm() {
  const { register, handleSubmit, setError, reset, formState: { errors } } = useForm<In, unknown, Out>({ resolver: zodResolver(chatSchema), defaultValues: { message: "" } });
  const { submit, pending, result } = useActionSubmit(async (v: Out) => { const r = await sendChatAction(v); if (r.ok) reset(); return r; }, setError);
  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      {result && !result.ok && <Notice kind="error">{result.message}</Notice>}
      <Field label="Message" htmlFor="message" error={errors.message?.message}><Textarea id="message" {...register("message")} /></Field>
      <Button type="submit" disabled={pending}>{pending ? "Thinking (CPU)…" : "Send"}</Button>
    </form>
  );
}
