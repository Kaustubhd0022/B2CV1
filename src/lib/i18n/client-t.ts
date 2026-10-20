/** Client-side interpolation over a message subset passed from the server (see clientMessages). */
export type ClientT = (key: string, vars?: Record<string, string | number>) => string;

export function makeClientT(messages: Record<string, string>): ClientT {
  return (key, vars) =>
    (messages[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => (vars && k in vars ? String(vars[k]) : `{${k}}`));
}
