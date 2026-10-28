"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/sign-in/actions";
import { IconAccount, IconLanguage, IconSettings, IconSignOut } from "./icons";
import { cx } from "./ui";

export interface UserSessionData {
  userId?: string;
  analyticsId?: string;
  email?: string | null;
  phone?: string | null;
  role?: "user" | "editor";
  language?: string | null;
}

export interface UserProfileMenuProps {
  user: UserSessionData | null;
  labels?: {
    profile?: string;
    account?: string;
    settings?: string;
    signOut?: string;
    signIn?: string;
  };
  variant?: "header" | "hero" | "compact";
}

export function UserProfileMenu({ user, labels, variant = "header" }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isGuest =
    !user ||
    user.analyticsId === "anon-explorer" ||
    user.email === "explorer@tattvaco.org" ||
    (!user.email && !user.phone);

  const displayName = isGuest
    ? "Guest Explorer"
    : user?.email
    ? user.email.split("@")[0]
    : user?.phone
    ? user.phone.slice(-4)
    : "Explorer";

  const initial = isGuest
    ? "✦"
    : (user?.email ?? user?.phone ?? "E").slice(0, 1).toUpperCase();

  // Close dropdown when navigating or clicking outside
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const profileLabel = labels?.profile || "Profile";
  const accountLabel = labels?.account || "My Profile & Journey";
  const settingsLabel = labels?.settings || "Settings & Preferences";
  const signOutLabel = labels?.signOut || "Sign Out";
  const signInLabel = labels?.signIn || "Sign In / Register";

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User Profile & Account Menu"
        className={cx(
          "group flex items-center gap-1.5 sm:gap-2 rounded-full border transition-all duration-200 outline-none select-none",
          variant === "hero"
            ? "border-[#24131E]/15 bg-white/80 px-2.5 py-1 text-xs text-[#20101B] hover:bg-white hover:border-amber-600/40 shadow-xs backdrop-blur-md"
            : "border-[#24131E]/12 bg-white/90 px-2 py-1 sm:px-2.5 sm:py-1 hover:border-amber-600/40 hover:bg-white shadow-2xs",
          isOpen && "ring-2 ring-amber-600/25 border-amber-600/50 bg-white"
        )}
      >
        {/* Avatar badge */}
        <span
          className={cx(
            "flex size-6 sm:size-7 items-center justify-center rounded-full font-serif font-bold transition-transform group-hover:scale-105 shadow-2xs",
            isGuest
              ? "bg-amber-100/90 text-amber-800 border border-amber-300/60 text-xs"
              : user?.role === "editor"
              ? "bg-[#24131E] text-amber-300 border border-amber-400/40 text-xs"
              : "bg-[#24131E] text-white text-xs"
          )}
        >
          {initial}
        </span>

        {/* User name / status */}
        <span className="hidden sm:inline-block max-w-[110px] truncate text-xs font-semibold text-[#20101B] tracking-tight">
          {displayName}
        </span>

        {/* Online / Active session dot */}
        <span
          className={cx(
            "size-2 rounded-full shrink-0",
            isGuest ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
          )}
          title={isGuest ? "Guest Explorer Mode" : "Authenticated Session"}
        />

        {/* Chevron icon */}
        <svg
          className={cx(
            "size-3 text-[#7E6674] transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-[#20101B]"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Floating Glass Card */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 origin-top-right rounded-3xl border border-[#F0DCE4] bg-white/95 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User Information Header */}
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#FFF5F8] to-[#FAF0F4] p-3.5 border border-[#F0DCE4]/60">
            <span
              className={cx(
                "flex size-11 shrink-0 items-center justify-center rounded-2xl font-serif text-base font-bold shadow-sm",
                isGuest
                  ? "bg-amber-100 text-amber-900 border border-amber-300/80"
                  : "bg-[#24131E] text-white"
              )}
            >
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-bold text-[#20101B]">
                  {isGuest ? "Cultural Explorer" : user?.email ?? displayName}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <span
                  className={cx(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                    isGuest
                      ? "bg-amber-500/10 text-amber-800 border border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-800 border border-emerald-500/30"
                  )}
                >
                  {isGuest ? "Guest Mode" : "Verified Explorer"}
                </span>
                {user?.role === "editor" && (
                  <span className="inline-flex items-center rounded-full bg-[#24131E] px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                    Editor
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-2 space-y-1">
            <Link
              href="/settings/account"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-[#20101B] hover:bg-[#FAF0F4] hover:text-amber-800 transition-colors"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#24131E]/5 text-[#24131E]">
                <IconAccount width={16} height={16} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block font-semibold">{accountLabel}</span>
                <span className="block text-[11px] text-[#7E6674]">Telemetry, profile & identities</span>
              </div>
            </Link>

            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-[#20101B] hover:bg-[#FAF0F4] hover:text-amber-800 transition-colors"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#24131E]/5 text-[#24131E]">
                <IconSettings width={16} height={16} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block font-semibold">{settingsLabel}</span>
                <span className="block text-[11px] text-[#7E6674]">Privacy, language & controls</span>
              </div>
            </Link>

            <Link
              href={`/language?next=${encodeURIComponent(pathname)}`}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-[#20101B] hover:bg-[#FAF0F4] hover:text-amber-800 transition-colors"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#24131E]/5 text-[#24131E]">
                <IconLanguage width={16} height={16} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block font-semibold">Change Language</span>
                <span className="block text-[11px] text-[#7E6674]">11 Regional Indian Languages</span>
              </div>
            </Link>

            {user?.role === "editor" && (
              <Link
                href="/editorial"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-amber-500/10 px-3 py-2.5 text-xs font-medium text-amber-900 hover:bg-amber-500/20 transition-colors border border-amber-500/20"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-[#24131E] text-amber-300 font-serif">
                  ✦
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block font-semibold">Editorial Workspace</span>
                  <span className="block text-[11px] text-amber-800">Curator review & statutory publishing</span>
                </div>
              </Link>
            )}
          </div>

          {/* Action Footer: Sign In or Sign Out */}
          <div className="mt-2 border-t border-[#F0DCE4] pt-2">
            {isGuest ? (
              <div className="space-y-1.5 p-1">
                <Link
                  href={`/sign-in?next=${encodeURIComponent(pathname)}`}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#24131E] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#381C2E] transition-all"
                >
                  <span>✦</span>
                  <span>{signInLabel}</span>
                </Link>
                <form action={signOut} className="w-full">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-medium text-[#7E6674] hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  >
                    <IconSignOut width={14} height={14} />
                    <span>Reset Guest Session</span>
                  </button>
                </form>
              </div>
            ) : (
              <form action={signOut} className="w-full p-1">
                <button
                  type="submit"
                  role="menuitem"
                  className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-800 transition-colors"
                >
                  <span className="flex size-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700 group-hover:bg-rose-200 transition-colors">
                    <IconSignOut width={15} height={15} />
                  </span>
                  <span>{signOutLabel}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
