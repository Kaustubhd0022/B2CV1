import type { Risk } from "./types";

/**
 * PROVISIONAL sensitive-topic taxonomy (OD-03 is open). Deterministic, keyword-based and
 * deliberately conservative; it is combined with the model's own risk label (max wins) so the
 * model can only RAISE risk, never lower a deterministic flag.
 *
 *  - high_risk: requests to rank, denigrate or assign collective blame to communities, or to
 *    adjudicate live religious/legal disputes. → abstain with a respectful explanation.
 *  - sensitive: caste, communal violence, contested histories, sacred/restricted practice,
 *    health claims of traditional remedies. → stricter handling: never auto-approved as
 *    routine; perspectives/limitations required.
 */
export const TAXONOMY: { category: string; risk: Exclude<Risk, "routine">; patterns: RegExp[] }[] = [
  {
    category: "ranking_or_denigrating_groups",
    risk: "high_risk",
    patterns: [
      /\b(which|what)\s+(religion|caste|community|tribe|race)\s+is\s+(better|superior|worse|inferior|best|worst)\b/i,
      /\b(superior|inferior|lower|higher)\s+(caste|castes|religion|community|race)\b/i,
      /\b(caste|religion|community)\s+(is|are)\s+(inferior|superior|dirty|impure)\b/i,
      /\bwho\s+is\s+to\s+blame\s+for\s+(the\s+)?(riots?|partition|violence)\b/i,
    ],
  },
  {
    category: "adjudicating_live_disputes",
    risk: "high_risk",
    patterns: [
      /\b(who|which community)\s+(really\s+)?(owns?|should own|has the right to)\b.*\b(temple|mosque|site|shrine|land)\b/i,
      /\b(gyanvapi|babri|ram janmabhoomi|ayodhya dispute|shahi idgah)\b.*\b(belong|own|right|rightful|true)\b/i,
    ],
  },
  {
    category: "caste_and_social_hierarchy",
    risk: "sensitive",
    patterns: [/\b(caste|jati|varna|untouchab\w*|dalit|brahmin\w*|savarna)\b/i, /जाति|छुआछूत|दलित/],
  },
  {
    category: "communal_violence_and_partition",
    risk: "sensitive",
    patterns: [/\b(riot|riots|pogrom|massacre|partition|communal violence|demolition)\b/i, /दंगा|विभाजन/],
  },
  {
    category: "contested_histories_and_sites",
    risk: "sensitive",
    patterns: [
      /\b(aryan (invasion|migration)|temple destruction|destroyed temples?|forced conversions?|religious conversions?|kohinoor|babri|gyanvapi|ayodhya|mathura dispute)\b/i,
    ],
  },
  {
    category: "sacred_or_restricted_practice",
    risk: "sensitive",
    patterns: [/\b(secret (ritual|rite)|initiation rites?|tantric (ritual|practice)s?|sacred grove|restricted knowledge|sati|human sacrifice|animal sacrifice)\b/i],
  },
  {
    category: "health_claims_of_tradition",
    risk: "sensitive",
    patterns: [/\b(cure|cures|treat|treats|heal|heals)\b.*\b(cancer|diabetes|disease|covid|illness)\b/i, /\b(ayurved\w*|siddha|unani)\b.*\b(cure|treat)\w*/i],
  },
  {
    category: "existence_or_truth_of_belief",
    risk: "sensitive",
    // Only when the question asks whether a belief figure/text/event is literally true.
    patterns: [
      /^(?=.*\b(gods?|deity|deities|rama|ram|krishna|shiva|ramayana|mahabharata|myths?|legends?|miracles?|avatars?)\b)(?=.*\b(really|actually|historically|literally)\b)(?=.*\b(exist\w*|real|happen\w*|true)\b)/i,
      /\bis\s+(the\s+)?(ramayana|mahabharata)\s+(true|real|history|historical)\b/i,
    ],
  },
];

const ORDER: Record<Risk, number> = { routine: 0, sensitive: 1, high_risk: 2 };
export const maxRisk = (a: Risk, b: Risk): Risk => (ORDER[a] >= ORDER[b] ? a : b);

export function classifySensitivity(text: string): { risk: Risk; categories: string[] } {
  let risk: Risk = "routine";
  const categories: string[] = [];
  for (const t of TAXONOMY) {
    if (t.patterns.some((p) => p.test(text))) {
      categories.push(t.category);
      risk = maxRisk(risk, t.risk);
    }
  }
  return { risk, categories };
}
