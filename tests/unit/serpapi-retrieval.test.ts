import { describe, expect, it, vi, afterEach } from "vitest";
import { serpApiSearch } from "@/lib/ai/retrieval";

describe("serpApiSearch provider", () => {
  const originalKey = process.env.SERPAPI_API_KEY;

  afterEach(() => {
    process.env.SERPAPI_API_KEY = originalKey;
    vi.restoreAllMocks();
  });

  it("extracts answer box, knowledge graph, and organic results", async () => {
    process.env.SERPAPI_API_KEY = "test-serp-key";
    const mockSerpResponse = {
      answer_box: {
        title: "Varanasi Ghats Overview",
        snippet: "Varanasi has 84 sacred ghats along the crescent curve of the Ganga.",
        link: "https://example.org/ghats",
      },
      knowledge_graph: {
        title: "Ganga River",
        description: "Sacred trans-boundary river of Asia which flows through India and Bangladesh.",
        source: { name: "Knowledge Partner", link: "https://example.org/ganga" },
      },
      organic_results: [
        {
          title: "Kadhwa Silk Weaving Guilds",
          snippet: "Master weavers in Madanpura hand-engrave pure gold zari into mulberry silk.",
          link: "https://example.org/kadhwa",
          source: "National Handloom Portal",
        },
      ],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSerpResponse,
      }),
    );

    const candidates = await serpApiSearch(
      "Varanasi crafts and riverfront",
      "en",
      AbortSignal.timeout(5000),
      3,
    );

    expect(candidates.length).toBe(3);

    // Answer box candidate
    const answerBox = candidates.find((c) => c.heading === "Varanasi Ghats Overview");
    expect(answerBox).toBeDefined();
    expect(answerBox?.provider).toBe("serpapi");
    expect(answerBox?.source.tier).toBe(2);

    // Knowledge graph candidate
    const kg = candidates.find((c) => c.heading === "Ganga River");
    expect(kg).toBeDefined();
    expect(kg?.provider).toBe("serpapi");

    // Organic result candidate
    const organic = candidates.find((c) => c.heading === "Kadhwa Silk Weaving Guilds");
    expect(organic).toBeDefined();
    expect(organic?.source.publisher).toContain("National Handloom Portal");
    expect(organic?.source.url).toBe("https://example.org/kadhwa");
  });

  it("handles network failure cleanly by throwing an error catchable by caller", async () => {
    process.env.SERPAPI_API_KEY = "test-serp-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("SerpApi network timeout")),
    );

    await expect(
      serpApiSearch("fail test", "en", AbortSignal.timeout(1000)),
    ).rejects.toThrow("SerpApi network timeout");
  });
});
