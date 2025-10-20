export async function trackTelemetry(
  event: string,
  metadata: Record<string, any> = {}
) {
  try {
    await fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ event, ...metadata }),
    });
  } catch (error) {
    console.warn("Failed to send telemetry", { event, metadata, error });
  }
}
