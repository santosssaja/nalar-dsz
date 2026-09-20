import { AiChatChunk } from "./types";

/**
 * Parses a complete static string into thought and answer text.
 */
export function splitThinkAndText(rawText: string): { thought?: string; text: string } {
  const thinkStart = rawText.indexOf("<think>");
  if (thinkStart === -1) {
    return { text: rawText.trim() };
  }

  const thinkEnd = rawText.indexOf("</think>");
  if (thinkEnd === -1) {
    // Tag opened but never closed
    const thought = rawText.slice(thinkStart + 7).trim();
    const before = rawText.slice(0, thinkStart).trim();
    return { thought: thought || undefined, text: before };
  }

  const before = rawText.slice(0, thinkStart).trim();
  const thought = rawText.slice(thinkStart + 7, thinkEnd).trim();
  const after = rawText.slice(thinkEnd + 8).trim();
  const text = [before, after].filter(Boolean).join("\n\n").trim();

  return { thought: thought || undefined, text };
}

/**
 * Transforms an async iterable stream of raw text chunks, isolating <think>...</think>
 * content as type: "thought" and the rest as type: "text".
 * Handles tags split across arbitrary chunk boundaries.
 */
export async function* transformThinkTags(
  stream: AsyncIterable<string>
): AsyncGenerator<{ type: "thought" | "text"; content: string }> {
  let isThinking = false;
  let buffer = "";

  for await (const chunk of stream) {
    buffer += chunk;

    while (buffer.length > 0) {
      if (!isThinking) {
        const thinkStartIndex = buffer.indexOf("<think>");
        if (thinkStartIndex !== -1) {
          if (thinkStartIndex > 0) {
            yield { type: "text", content: buffer.slice(0, thinkStartIndex) };
          }
          buffer = buffer.slice(thinkStartIndex + 7); // skip "<think>"
          isThinking = true;
        } else {
          // Check if buffer ends with a prefix of "<think>" (e.g. "<", "<t", "<th", etc.)
          let partialMatch = false;
          for (let i = 1; i < 7 && i <= buffer.length; i++) {
            if ("<think>".startsWith(buffer.slice(-i))) {
              const safeText = buffer.slice(0, -i);
              if (safeText) {
                yield { type: "text", content: safeText };
              }
              buffer = buffer.slice(-i);
              partialMatch = true;
              break;
            }
          }
          if (!partialMatch) {
            yield { type: "text", content: buffer };
            buffer = "";
          }
          break; // wait for next chunk
        }
      } else {
        // We are inside <think>
        const thinkEndIndex = buffer.indexOf("</think>");
        if (thinkEndIndex !== -1) {
          if (thinkEndIndex > 0) {
            yield { type: "thought", content: buffer.slice(0, thinkEndIndex) };
          }
          buffer = buffer.slice(thinkEndIndex + 8); // skip "</think>"
          isThinking = false;
        } else {
          // Check if buffer ends with a prefix of "</think>" (e.g. "<", "</", "</t", etc.)
          let partialMatch = false;
          for (let i = 1; i < 8 && i <= buffer.length; i++) {
            if ("</think>".startsWith(buffer.slice(-i))) {
              const safeThought = buffer.slice(0, -i);
              if (safeThought) {
                yield { type: "thought", content: safeThought };
              }
              buffer = buffer.slice(-i);
              partialMatch = true;
              break;
            }
          }
          if (!partialMatch) {
            yield { type: "thought", content: buffer };
            buffer = "";
          }
          break; // wait for next chunk
        }
      }
    }
  }

  // Flush remaining buffer
  if (buffer.length > 0) {
    yield { type: isThinking ? "thought" : "text", content: buffer };
  }
}

/**
 * Sanitizes and formats multi-turn chat messages into Google Generative API contents schema.
 * Ensures:
 * 1. Roles alternate strictly between 'user' and 'model' (merges consecutive identical roles).
 * 2. First message starts with role 'user'.
 * 3. System messages are excluded (should be placed in system_instruction instead).
 */
export function sanitizeGoogleContents(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
): Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> {
  const filtered = messages.filter((m) => m.role !== "system" && m.content.trim().length > 0);
  if (filtered.length === 0) {
    return [{ role: "user", parts: [{ text: "Halo Nai" }] }];
  }

  const result: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  for (const m of filtered) {
    const targetRole = m.role === "assistant" ? "model" : "user";
    const lastItem = result[result.length - 1];

    if (!lastItem) {
      if (targetRole === "model") {
        result.push({ role: "user", parts: [{ text: "Halo Nai" }] });
      }
      result.push({ role: targetRole, parts: [{ text: m.content }] });
    } else if (lastItem.role === targetRole) {
      lastItem.parts.push({ text: m.content });
    } else {
      result.push({ role: targetRole, parts: [{ text: m.content }] });
    }
  }

  return result;
}
