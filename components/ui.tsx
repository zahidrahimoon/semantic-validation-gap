/**
 * Minimal black-and-white UI primitives (plain Tailwind, no component library)
 * so the whole UI is reviewable in one file.
 */
import * as React from "react";
import Link from "next/link";

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  className,
  variant = "solid",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline" }) {
  return (
    <button
      className={cx(
        "inline-flex h-10 items-center justify-center border border-black px-4 text-sm font-medium",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "solid" ? "bg-black text-white hover:bg-white hover:text-black" : "bg-white text-black hover:bg-black hover:text-white",
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cx("inline-flex h-10 items-center border border-black bg-white px-4 text-sm font-medium text-black hover:bg-black hover:text-white", className)}
    >
      {children}
    </Link>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cx("h-10 w-full border border-black bg-white px-3 text-sm text-black outline-none focus:ring-2 focus:ring-black", className)}
      {...props}
    />
  );
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cx("min-h-28 w-full border border-black bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-black", className)}
      {...props}
    />
  );
});

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cx("h-10 w-full border border-black bg-white px-3 text-sm text-black outline-none focus:ring-2 focus:ring-black", className)}
      {...props}
    />
  );
});

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold uppercase tracking-wide">
      {children}
    </label>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs font-medium" role="alert">
          ✕ {error}
        </p>
      )}
    </div>
  );
}

export function Card({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <section className={cx("border border-black bg-white p-5", className)}>
      {title && <h2 className="mb-3 border-b border-black pb-2 text-lg font-bold">{title}</h2>}
      {children}
    </section>
  );
}

export function Notice({ children, kind = "info" }: { children: React.ReactNode; kind?: "info" | "ok" | "error" }) {
  return (
    <div className={cx("mb-4 border border-black p-3 text-sm", kind === "ok" && "bg-black text-white", kind === "error" && "border-2", kind === "info" && "bg-muted")}>
      {children}
    </div>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-block border border-black px-2 py-0.5 text-xs uppercase tracking-wide">{children}</span>;
}
