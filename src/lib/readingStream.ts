/** Decode chat completion events, including the final event without a trailing newline. */
export async function readReadingStream(body: ReadableStream<Uint8Array>, onChunk: (text: string) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let doneEvent = false;
  let finishReason: string | undefined;
  function line(raw: string) {
    if (!raw.startsWith("data:")) return;
    const data = raw.slice(5).trim();
    if (data === "[DONE]") { doneEvent = true; return; }
    if (!data) return;
    const choice = JSON.parse(data).choices?.[0];
    if (choice?.finish_reason) finishReason = choice.finish_reason;
    const content = choice?.delta?.content;
    if (typeof content === "string" && content) {
      text += content;
      onChunk(content);
    }
  }
  try {
    while (!doneEvent) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop()!;
      for (const entry of lines) { line(entry); if (doneEvent) break; }
      if (done) { if (!doneEvent) line(buffer); break; }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  return { text, complete: finishReason ? finishReason === "stop" : doneEvent };
}
