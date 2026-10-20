import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { config } from "@/lib/config";
import { log } from "@/lib/log";

/**
 * Replaceable model-provider boundary. The pipeline depends only on `LLMProvider`;
 * swapping vendors means adding another implementation here.
 */
export type LLMTask = "understand" | "answer" | "judge";
export type LLMError = "timeout" | "refusal" | "rate_limited" | "provider_error" | "invalid_output";
export type LLMResult<T> = { ok: true; data: T } | { ok: false; error: LLMError };

export interface LLMProvider {
  name: string;
  model: string;
  generate<T>(req: { task: LLMTask; system: string; user: string; schema: z.ZodType<T>; maxTokens?: number }): Promise<LLMResult<T>>;
}

class AnthropicProvider implements LLMProvider {
  name = "anthropic";
  private client: Anthropic;
  constructor(public model: string) {
    // Credentials resolve from the server environment (ANTHROPIC_API_KEY); never sent to the client.
    this.client = new Anthropic({ timeout: config().ai.timeoutMs, maxRetries: 2 });
  }

  async generate<T>(req: { task: LLMTask; system: string; user: string; schema: z.ZodType<T>; maxTokens?: number }): Promise<LLMResult<T>> {
    const effort = req.task === "answer" ? config().ai.effort : "low";
    try {
      const msg = await this.client.beta.messages.parse({
        model: this.model,
        max_tokens: req.maxTokens ?? (req.task === "answer" ? 16000 : 4000),
        // Server-side fallback on safety-classifier refusals, routed by refusal category.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { format: betaZodOutputFormat(req.schema as never), effort },
        system: req.system,
        messages: [{ role: "user", content: req.user }],
      });
      if (msg.stop_reason === "refusal") {
        log.warn("llm.refusal", { task: req.task, category: msg.stop_details?.category ?? null });
        return { ok: false, error: "refusal" };
      }
      if (msg.stop_reason === "max_tokens" || msg.parsed_output == null) return { ok: false, error: "invalid_output" };
      return { ok: true, data: msg.parsed_output as T };
    } catch (err) {
      if (err instanceof Anthropic.APIConnectionTimeoutError) return { ok: false, error: "timeout" };
      if (err instanceof Anthropic.RateLimitError) return { ok: false, error: "rate_limited" };
      if (err instanceof Anthropic.APIError) {
        log.warn("llm.api_error", { task: req.task, status: err.status ?? null });
        return { ok: false, error: "provider_error" };
      }
      // Structured output that fails schema validation surfaces as a parse error.
      log.warn("llm.error", { task: req.task, error: (err as Error).name });
      return { ok: false, error: "invalid_output" };
    }
  }
}

/**
 * Groq (OpenAI-compatible chat completions) with strict JSON-schema output. The response is
 * validated again with zod here; the pipeline's grounding checks then apply exactly as for any
 * other provider. The API key is read from GROQ_API_KEY on the server only.
 */
class GroqProvider implements LLMProvider {
  name = "groq";
  constructor(public model: string) {}

  async generate<T>(req: { task: LLMTask; system: string; user: string; schema: z.ZodType<T>; maxTokens?: number }): Promise<LLMResult<T>> {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { ok: false, error: "provider_error" };
    const reasoning = req.task === "answer" ? config().ai.effort : "low";
    let res = await this.call(key, req, reasoning);
    // Free-tier token-per-minute limits are tight: honour a short Retry-After once, then give up.
    if (res instanceof Response && res.status === 429) {
      const wait = Number(res.headers.get("retry-after"));
      if (Number.isFinite(wait) && wait > 0 && wait <= 20) {
        log.info("llm.rate_limited_retry", { provider: "groq", task: req.task, waitS: wait });
        await new Promise((r) => setTimeout(r, wait * 1000 + 250));
        res = await this.call(key, req, reasoning);
      }
    }
    if (!(res instanceof Response)) return { ok: false, error: res };
    if (res.status === 429) return { ok: false, error: "rate_limited" };
    if (!res.ok) {
      log.warn("llm.api_error", { task: req.task, provider: "groq", status: res.status });
      return { ok: false, error: "provider_error" };
    }
    const body = (await res.json().catch(() => null)) as { choices?: { message?: { content?: string; refusal?: string | null }; finish_reason?: string }[] } | null;
    const choice = body?.choices?.[0];
    if (choice?.message?.refusal) return { ok: false, error: "refusal" };
    if (!choice?.message?.content || choice.finish_reason === "length") return { ok: false, error: "invalid_output" };
    try {
      const parsed = req.schema.safeParse(JSON.parse(choice.message.content));
      return parsed.success ? { ok: true, data: parsed.data } : { ok: false, error: "invalid_output" };
    } catch {
      return { ok: false, error: "invalid_output" };
    }
  }

  private async call<T>(
    key: string,
    req: { task: LLMTask; system: string; user: string; schema: z.ZodType<T>; maxTokens?: number },
    reasoning: string,
  ): Promise<Response | "timeout" | "provider_error"> {
    try {
      return await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          max_completion_tokens: req.maxTokens ?? (req.task === "answer" ? 16000 : 4000),
          // gpt-oss models accept a reasoning effort; other models ignore it.
          ...(this.model.startsWith("openai/gpt-oss") ? { reasoning_effort: reasoning } : {}),
          messages: [
            { role: "system", content: req.system },
            { role: "user", content: req.user },
          ],
          response_format: { type: "json_schema", json_schema: { name: req.task, schema: z.toJSONSchema(req.schema), strict: true } },
        }),
        signal: AbortSignal.timeout(config().ai.timeoutMs),
      });
    } catch (err) {
      const name = (err as Error).name;
      return name === "TimeoutError" || name === "AbortError" ? "timeout" : "provider_error";
    }
  }
}

/**
 * TEST-ONLY scripted provider. Returns whatever the registered handler returns; used by the
 * evaluation fixtures and automated tests so the validation pipeline can be exercised
 * deterministically. It is refused in production by assertProductionSafety().
 */
export type ScriptHandler = (task: LLMTask, user: string) => unknown | { __error: LLMError };

export class ScriptedProvider implements LLMProvider {
  name = "scripted";
  model = "scripted-fixture";
  constructor(private handler: ScriptHandler) {}
  async generate<T>(req: { task: LLMTask; user: string; schema: z.ZodType<T> }): Promise<LLMResult<T>> {
    const out = this.handler(req.task, req.user);
    if (out && typeof out === "object" && "__error" in out) return { ok: false, error: (out as { __error: LLMError }).__error };
    const parsed = req.schema.safeParse(out);
    return parsed.success ? { ok: true, data: parsed.data } : { ok: false, error: "invalid_output" };
  }
}

const g = globalThis as unknown as { __tcLLM?: LLMProvider | null };

export function setProviderForTests(p: LLMProvider | null) {
  g.__tcLLM = p;
}

/** Returns the configured provider, or null when AI generation is not configured. */
export function getProvider(): LLMProvider | null {
  if (g.__tcLLM !== undefined) return g.__tcLLM;
  const c = config();
  if (c.ai.provider === "anthropic") return new AnthropicProvider(c.ai.model);
  if (c.ai.provider === "groq") return new GroqProvider(c.ai.model);
  return null;
}
