/**
 * Structured JSON logging. Callers pass event names and non-sensitive fields only:
 * never question text, tokens, codes, emails or phone numbers.
 */
type Fields = Record<string, string | number | boolean | null | undefined>;

function emit(level: "info" | "warn" | "error", event: string, fields?: Fields) {
  if (process.env.NODE_ENV === "test" && level === "info") return;
  const line = JSON.stringify({ level, event, ...fields, ts: new Date().toISOString() });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (event: string, fields?: Fields) => emit("info", event, fields),
  warn: (event: string, fields?: Fields) => emit("warn", event, fields),
  error: (event: string, fields?: Fields) => emit("error", event, fields),
};
