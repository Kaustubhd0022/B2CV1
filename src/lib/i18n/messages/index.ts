import type { MessageKey } from "./en";
import type { LanguageCode } from "../languages";
import hi from "./hi";
import kn from "./kn";
import ml from "./ml";
import bn from "./bn";
import ta from "./ta";
import mr from "./mr";
import te from "./te";
import gu from "./gu";
import pa from "./pa";
import or from "./or";

export type Catalogue = Partial<Record<MessageKey, string>>;

/**
 * Non-English catalogues are UNREVIEWED drafts produced with AI assistance for the
 * core journey only. They must pass native-speaker review (release gate G1) before any
 * language is described as supported.
 */
export const CATALOGUES: Partial<Record<LanguageCode, Catalogue>> = { hi, kn, ml, bn, ta, mr, te, gu, pa, or };
