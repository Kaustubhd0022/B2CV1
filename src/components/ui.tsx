import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { IconBack, IconCheck, IconInfo, IconWarning } from "./icons";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ---------------- Buttons (Design §5A) ---------------- */

type Variant = "primary" | "secondary" | "tertiary" | "terracotta";
const btn: Record<Variant, string> = {
  primary:
    "bg-forest text-on-forest hover:bg-forest-hover active:scale-[0.985] disabled:bg-muted/30 disabled:text-muted disabled:cursor-not-allowed shadow-xs font-semibold",
  secondary:
    "border border-border bg-surface text-charcoal hover:bg-surface-2 hover:border-forest/40 active:scale-[0.985] disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs font-medium",
  terracotta:
    "bg-terracotta text-white hover:bg-terracotta-hover active:scale-[0.985] disabled:bg-muted/30 disabled:cursor-not-allowed shadow-xs font-semibold",
  tertiary: "text-forest underline-offset-4 hover:underline px-1 font-medium",
};
const btnBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-support transition-all duration-200";

export function Button({
  variant = "primary",
  className,
  loading,
  children,
  ...rest
}: ComponentProps<"button"> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      className={cx(btnBase, btn[variant], className)}
      aria-busy={loading || undefined}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  ...rest
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={cx(btnBase, btn[variant], className)} {...rest} />;
}

/* ---------------- Layout ---------------- */

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 md:px-8 md:pb-16", className)}>{children}</div>;
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="-ml-1 inline-flex min-h-11 items-center gap-1 text-support font-medium text-forest hover:text-forest-hover transition-colors">
      <IconBack width={18} height={18} />
      {label}
    </Link>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-meta font-semibold uppercase tracking-[0.16em] text-terracotta">{children}</p>;
}

export function SectionTitle({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="font-serif text-section md:text-section-lg font-semibold text-charcoal tracking-tight">
      {children}
    </h2>
  );
}

/* ---------------- Notices (never colour alone: icon + text) ---------------- */

type Tone = "info" | "warning" | "error" | "success";
const toneCls: Record<Tone, string> = {
  info: "border-info/30 bg-info/5 text-info",
  warning: "border-warning/40 bg-warning/5 text-warning",
  error: "border-error/40 bg-error/5 text-error",
  success: "border-success/40 bg-success/5 text-success",
};

export function Notice({
  tone = "info",
  title,
  children,
  role,
  className,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  role?: "status" | "alert";
  className?: string;
}) {
  const Icon = tone === "success" ? IconCheck : tone === "info" ? IconInfo : IconWarning;
  return (
    <div role={role} className={cx("flex gap-3 rounded-md border px-4 py-3", toneCls[tone], className)}>
      <Icon className="mt-0.5 shrink-0" width={20} height={20} />
      <div className="min-w-0 text-support text-charcoal">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-1" : undefined}>{children}</div>}
      </div>
    </div>
  );
}

export function FixtureBadge({ label, onDark }: { label: string; onDark?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-meta font-semibold",
        onDark ? "border-white/60 bg-white text-warning" : "border-warning/50 bg-warning/10 text-warning",
      )}
    >
      <IconWarning width={14} height={14} />
      {label}
    </span>
  );
}

/* ---------------- Epistemic labels (FR-10) ---------------- */

export type Epistemic = "documented" | "tradition" | "interpretation" | "contested" | "uncertain";
const epiCls: Record<Epistemic, string> = {
  documented: "border-forest/40 text-forest bg-forest/5",
  tradition: "border-terracotta/50 text-terracotta-text bg-terracotta/5",
  interpretation: "border-info/40 text-info bg-info/5",
  contested: "border-warning/50 text-warning bg-warning/10",
  uncertain: "border-muted/50 text-muted bg-surface-2",
};
const epiMark: Record<Epistemic, string> = {
  documented: "●",
  tradition: "◆",
  interpretation: "▲",
  contested: "⇄",
  uncertain: "?",
};

export function EpistemicLabel({ kind, label }: { kind: Epistemic; label: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-sm border px-1.5 py-px text-meta font-semibold align-middle",
        epiCls[kind],
      )}
    >
      <span aria-hidden="true">{epiMark[kind]}</span>
      {label}
    </span>
  );
}

/* ---------------- Cards ---------------- */

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-md border border-border bg-surface", className)}>{children}</div>;
}

export function ImageCredit({ text }: { text: string }) {
  return <span className="text-meta text-muted">{text}</span>;
}
