/** Runs once at server start: refuse to boot with unsafe production configuration. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertProductionSafety } = await import("@/lib/config");
    assertProductionSafety();
  }
}
