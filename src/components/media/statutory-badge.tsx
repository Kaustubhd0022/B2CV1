import Link from "next/link";
import { IconExternal } from "@/components/icons";
import { cx } from "@/components/ui";

export type StatutoryType =
  | "asi"
  | "unesco"
  | "gi"
  | "sangeet_natak"
  | "sahapedia"
  | "indian_culture"
  | "state_archaeology";

export interface StatutoryBadgeProps {
  type: StatutoryType;
  title?: string;
  regNumber?: string;
  url?: string;
  className?: string;
}

const BADGE_CONFIG: Record<
  StatutoryType,
  {
    symbol: string;
    label: string;
    defaultUrl: string;
    borderCls: string;
    bgCls: string;
    textCls: string;
  }
> = {
  asi: {
    symbol: "🏛️",
    label: "ASI Protected Monument",
    defaultUrl: "https://asi.nic.in/",
    borderCls: "border-amber-500/40",
    bgCls: "bg-amber-500/10",
    textCls: "text-amber-300",
  },
  unesco: {
    symbol: "🌐",
    label: "UNESCO World / Living Heritage",
    defaultUrl: "https://ich.unesco.org/en/state/india-IN",
    borderCls: "border-blue-500/40",
    bgCls: "bg-blue-500/10",
    textCls: "text-blue-300",
  },
  gi: {
    symbol: "🏷️",
    label: "GI Tag Certified (IP India)",
    defaultUrl: "https://ipindia.gov.in/",
    borderCls: "border-emerald-500/40",
    bgCls: "bg-emerald-500/10",
    textCls: "text-emerald-300",
  },
  sangeet_natak: {
    symbol: "🎵",
    label: "Sangeet Natak Akademi Lineage",
    defaultUrl: "https://sangeetnatak.gov.in/",
    borderCls: "border-purple-500/40",
    bgCls: "bg-purple-500/10",
    textCls: "text-purple-300",
  },
  sahapedia: {
    symbol: "📚",
    label: "Sahapedia Documented Archive",
    defaultUrl: "https://www.sahapedia.org/",
    borderCls: "border-gold/40",
    bgCls: "bg-gold/10",
    textCls: "text-gold",
  },
  indian_culture: {
    symbol: "✦",
    label: "National Virtual Library Archive",
    defaultUrl: "https://www.indianculture.gov.in/",
    borderCls: "border-forest/40",
    bgCls: "bg-forest/10",
    textCls: "text-forest",
  },
  state_archaeology: {
    symbol: "📜",
    label: "State Archaeological Survey",
    defaultUrl: "https://tnarchaeology.gov.in/",
    borderCls: "border-stone-500/40",
    bgCls: "bg-stone-500/10",
    textCls: "text-stone-300",
  },
};

export function StatutoryEvidenceBadge({
  type,
  title,
  regNumber,
  url,
  className,
}: StatutoryBadgeProps) {
  const conf = BADGE_CONFIG[type];
  const targetUrl = url || conf.defaultUrl;

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(
        "group inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold transition-all hover:scale-[1.02] shadow-2xs backdrop-blur-md",
        conf.borderCls,
        conf.bgCls,
        conf.textCls,
        className,
      )}
      title={`${title || conf.label} — Official Government / Statutory Archive`}
    >
      <span className="text-xs" aria-hidden="true">
        {conf.symbol}
      </span>
      <span>
        {title || conf.label}
        {regNumber ? ` (${regNumber})` : ""}
      </span>
      <IconExternal
        width={10}
        height={10}
        className="opacity-60 transition-opacity group-hover:opacity-100"
      />
    </a>
  );
}
