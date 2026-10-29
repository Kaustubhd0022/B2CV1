import type { Metadata } from "next";
import { emailConfigured } from "@/lib/auth/delivery";
import { oauthConfigured } from "@/lib/auth/oauth";
import { safeNext } from "@/lib/auth/normalize";
import { isLanguageCode } from "@/lib/i18n/languages";
import { CinematicSignIn } from "@/components/cinema/cinematic-sign-in";

export const metadata: Metadata = {
  title: "Discover India Differently · TattvaCo Passport",
  description: "Connect stories, living traditions, sacred places and philosophical ideas across 5,000 years of living Indian culture.",
};

const ERRORS: Record<string, string> = {
  invalid_email: "Please enter a valid email address.",
  invalid_credentials: "Incorrect email or password. Please try again.",
  too_many: "Too many attempts. Please try again later.",
  delivery: "Failed to send code. Please try again.",
  unavailable: "Service temporarily unavailable.",
  oauth_failed: "Authentication failed. Please try again.",
  google_not_configured: "Google Sign-In is not yet configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.",
  apple_not_configured: "Apple Sign-In is not configured.",
  link_conflict: "An account with this email is already linked.",
  expired_code: "Code expired. Please request a new code.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const hl = isLanguageCode(sp.hl) ? sp.hl : "en";
  const next = safeNext(sp.next);
  const errorMessage = sp.error ? (ERRORS[sp.error] ?? "An error occurred. Please try again.") : undefined;
  const google = oauthConfigured("google");
  const email = emailConfigured();

  const pilotCities = [
    { slug: "varanasi", name: "Varanasi", state: "Uttar Pradesh", img: "/images/dev/varanasi-card.jpg" },
    { slug: "jaipur", name: "Jaipur", state: "Rajasthan", img: "/images/dev/jaipur.jpg" },
    { slug: "hampi", name: "Hampi", state: "Karnataka", img: "/images/dev/hampi.jpg" },
    { slug: "kochi", name: "Kochi", state: "Kerala", img: "/images/dev/kochi.jpg" },
    { slug: "kolkata", name: "Kolkata", state: "West Bengal", img: "/images/dev/kolkata.jpg" },
    { slug: "madurai", name: "Madurai", state: "Tamil Nadu", img: "/images/dev/madurai.jpg" },
  ];

  const categories = [
    { label: "Places" },
    { label: "People" },
    { label: "Festivals" },
    { label: "Food" },
    { label: "Crafts" },
    { label: "History" },
    { label: "Traditions" },
  ];

  return (
    <CinematicSignIn
      categories={categories}
      pilotCities={pilotCities}
      next={next}
      errorMessage={errorMessage}
      googleConfigured={google}
      emailConfigured={email}
      activeLanguage={hl}
    />
  );
}
