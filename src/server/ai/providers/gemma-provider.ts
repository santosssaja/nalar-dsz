import {
  IAiProvider,
  AiMessage,
  AiChatOptions,
  AiChatResponse,
  AiSocraticContext,
  AiTeachContext,
  AiTeachEvaluation,
  AiChatChunk,
  AiTeachChunk,
  AiPredictContext,
  AiPredictAnalysis,
} from "../types";
import {
  NAI_SOCRATIC_SYSTEM_PROMPT,
  NAI_TEACH_MODE_SYSTEM_PROMPT,
  NAI_PREDICT_SYSTEM_PROMPT,
  buildSocraticPrompt,
  buildTeachPrompt,
  buildPredictPrompt,
} from "../prompts";
import { CuratedLocalProvider } from "./curated-provider";
import { transformThinkTags, sanitizeGoogleContents } from "../stream-utils";
import { parseAiError } from "../error-utils";

export class GemmaProvider implements IAiProvider {
  public readonly name = "gemma" as const;
  private readonly fallback = new CuratedLocalProvider();

  private getApiKey(options?: AiChatOptions): string | undefined {
    return (
      options?.apiKey ||
      process.env.GEMMA_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.AI_API_KEY
    );
  }

  private getModelName(options?: AiChatOptions): string {
    return options?.model || process.env.GEMMA_MODEL || "gemma-4-31b-it";
  }

  private getLocalEndpoint(options?: AiChatOptions): string | undefined {
    return (
      options?.endpoint ||
      process.env.GEMMA_ENDPOINT ||
      process.env.AI_ENDPOINT ||
      process.env.OLLAMA_ENDPOINT
    ); // e.g. "http://localhost:11434"
  }

  /**
   * Direct resilient call to Google Generative Language API.
   * Strips out raw internal thoughts so they are never leaked into final text.
   */
  private async callGoogleApi(
    systemInstruction: string | undefined,
    messages: AiMessage[],
    apiKey: string,
    modelName: string,
    isJson = false
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const contents = sanitizeGoogleContents(messages);

    const body: Record<string, unknown> = {
      contents,
    };

    if (systemInstruction) {
      body.system_instruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    if (isJson) {
      body.generationConfig = {
        response_mime_type: "application/json",
      };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Google API call error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    // Separate out thoughts so raw internal reasoning is never returned in final text
    const textParts = parts.filter((p: { thought?: boolean; text?: string }) => !p.thought && p.text);
    const cleanText = textParts.map((p: { text: string }) => p.text).join("");
    return cleanText || parts.map((p: { text?: string }) => p.text || "").join("");
  }

  /**
   * Direct SSE streaming from Google Generative Language API.
   * Emits parts with thought: true as type: "thought" and actual responses as type: "text".
   * Resilient to network jitter and format variations.
   */
  private async *streamFromGoogleApi(
    systemInstruction: string | undefined,
    messages: AiMessage[],
    apiKey: string,
    modelName: string
  ): AsyncGenerator<AiChatChunk> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const contents = sanitizeGoogleContents(messages);

    const body: Record<string, unknown> = {
      contents,
    };

    if (systemInstruction) {
      body.system_instruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Google API error (${res.status}): ${errText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith("data: ")) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.error) {
              throw new Error(`Google API stream error (${data.error.code}): ${data.error.message}`);
            }
            const parts = data.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
              if (part.thought && part.text) {
                yield { type: "thought", content: part.text, provider: "gemma", model: modelName };
              } else if (part.text) {
                yield { type: "text", content: part.text, provider: "gemma", model: modelName };
              }
            }
          } catch (e) {
            if (e instanceof Error && e.message.includes("Google API stream error")) throw e;
          }
        } else if (trimmed.startsWith("{") && trimmed.includes('"error"')) {
          try {
            const errData = JSON.parse(trimmed);
            if (errData.error?.message) {
              throw new Error(`Google API mid-stream error: ${errData.error.message}`);
            }
          } catch (e) {
            if (e instanceof Error && e.message.includes("Google API")) throw e;
          }
        }
      }
    }
  }

  async chat(messages: AiMessage[], options?: AiChatOptions): Promise<AiChatResponse> {
    const apiKey = this.getApiKey(options);
    const localEndpoint = this.getLocalEndpoint(options);
    const modelName = this.getModelName(options);

    // 1. Try Local Ollama/vLLM endpoint if configured
    if (localEndpoint) {
      try {
        const res = await fetch(`${localEndpoint}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: modelName.includes("gemma") ? modelName : "gemma2",
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            stream: false,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          return {
            text: json.message?.content ?? json.response ?? "",
            provider: "gemma",
            model: modelName,
          };
        }
      } catch {
        // Fall through to Google API
      }
    }

    // 2. Try Google Generative API if API key is present
    if (apiKey) {
      try {
        const systemMessage = messages.find((m) => m.role === "system");
        const dialogue = messages.filter((m) => m.role !== "system");
        const text = await this.callGoogleApi(
          systemMessage?.content,
          dialogue.length > 0 ? dialogue : [{ role: "user", content: "Halo" }],
          apiKey,
          modelName
        );
        return {
          text,
          provider: "gemma",
          model: modelName,
        };
      } catch {
        // Fall through to curated fallback
      }
    }

    // 3. Seamless Curated Fallback
    const fallbackRes = await this.fallback.chat(messages, options);
    return {
      ...fallbackRes,
      provider: "gemma",
      model: `${modelName} (fallback-curated)`,
    };
  }

  async socraticGuidance(
    context: AiSocraticContext,
    options?: AiChatOptions
  ): Promise<AiChatResponse> {
    const messages: AiMessage[] = [
      { role: "system", content: NAI_SOCRATIC_SYSTEM_PROMPT },
      ...(context.recentChatHistory || []),
      { role: "user", content: buildSocraticPrompt(context) },
    ];

    const apiKey = this.getApiKey(options);
    const localEndpoint = this.getLocalEndpoint(options);

    if (apiKey || localEndpoint) {
      try {
        return await this.chat(messages, options);
      } catch {
        // fallback
      }
    }

    const fallbackRes = await this.fallback.socraticGuidance(context, options);
    return {
      ...fallbackRes,
      provider: "gemma",
      model: `${this.getModelName(options)} (offline-curated)`,
    };
  }

  async *socraticGuidanceStream(
    context: AiSocraticContext,
    options?: AiChatOptions
  ): AsyncIterable<AiChatChunk> {
    const systemPrompt = NAI_SOCRATIC_SYSTEM_PROMPT;
    const messages: AiMessage[] = [
      ...(context.recentChatHistory || []),
      { role: "user", content: buildSocraticPrompt(context) },
    ];

    const apiKey = this.getApiKey(options);
    const localEndpoint = this.getLocalEndpoint(options);
    const modelName = this.getModelName(options);

    // 1. Try Local Ollama stream if endpoint is configured
    if (localEndpoint) {
      try {
        const fullMessages = [
          { role: "system" as const, content: systemPrompt },
          ...messages,
        ];
        const res = await fetch(`${localEndpoint}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: modelName.includes("gemma") ? modelName : "gemma2",
            messages: fullMessages.map((m) => ({ role: m.role, content: m.content })),
            stream: true,
          }),
        });

        if (res.ok && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let lineBuffer = "";

          async function* readOllamaStream(): AsyncGenerator<string> {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              lineBuffer += decoder.decode(value, { stream: true });
              const lines = lineBuffer.split("\n");
              lineBuffer = lines.pop() || "";
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                try {
                  const json = JSON.parse(trimmed);
                  const content = json.message?.content || "";
                  if (content) yield content;
                } catch {}
              }
            }
          }

          for await (const chunk of transformThinkTags(readOllamaStream())) {
            yield { ...chunk, provider: "gemma", model: modelName };
          }
          yield { type: "done", provider: "gemma", model: modelName };
          return;
        }
      } catch {
        // Fallback to Google API
      }
    }

    // 2. Try Google Generative API (Gemma models) with native thought separation
    if (apiKey) {
      let hasEmittedChunks = false;
      try {
        for await (const chunk of this.streamFromGoogleApi(systemPrompt, messages, apiKey, modelName)) {
          hasEmittedChunks = true;
          yield chunk;
        }
        yield { type: "done", provider: "gemma", model: modelName };
        return;
      } catch (err) {
        console.warn("GemmaProvider Google API stream notice:", err);
        // If stream already delivered content, conclude stream gracefully without duplicate restart
        if (hasEmittedChunks) {
          yield { type: "done", provider: "gemma", model: modelName };
          return;
        }
        const parsed = parseAiError(err, modelName);
        if (parsed.isRateLimit) {
          yield {
            type: "notice",
            content: `⚠️ Batas kuota atau request model ${modelName} sedang penuh (HTTP 429). Nai beralih sementara ke respon terkurasi offline. Kamu juga dapat memilih model lain di pemilih model.`,
            code: parsed.code,
            provider: "gemma",
            model: `${modelName} (offline-curated)`,
          };
        }
        // Fall through to curated fallback
      }
    }

    // 3. Fallback to Curated stream
    for await (const chunk of this.fallback.socraticGuidanceStream(context, options)) {
      yield {
        ...chunk,
        provider: "gemma",
        model: `${modelName} (offline-curated)`,
      };
    }
  }

  async evaluateTeachMode(
    context: AiTeachContext,
    options?: AiChatOptions
  ): Promise<AiTeachEvaluation> {
    const apiKey = this.getApiKey(options);
    const localEndpoint = this.getLocalEndpoint(options);
    const modelName = this.getModelName(options);

    // 1. Try Google Generative API with JSON mode
    if (apiKey) {
      try {
        const text = await this.callGoogleApi(
          NAI_TEACH_MODE_SYSTEM_PROMPT,
          [{ role: "user", content: buildTeachPrompt(context) }],
          apiKey,
          modelName,
          true
        );

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            understood: Boolean(parsed.understood),
            score: typeof parsed.score === "number" ? parsed.score : 85,
            naiResponse: String(parsed.naiResponse || "Terima kasih sudah menjelaskan!"),
            feedbackForTeacher: String(parsed.feedbackForTeacher || "Penjelasanmu sangat mendalam."),
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
          };
        }
      } catch (err) {
        console.warn("Gemma evaluateTeachMode API notice:", err);
      }
    }

    // 2. Try Local Ollama
    if (localEndpoint) {
      try {
        const messages: AiMessage[] = [
          { role: "system", content: NAI_TEACH_MODE_SYSTEM_PROMPT },
          { role: "user", content: buildTeachPrompt(context) },
        ];
        const res = await this.chat(messages, options);
        const jsonMatch = res.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            understood: Boolean(parsed.understood),
            score: typeof parsed.score === "number" ? parsed.score : 80,
            naiResponse: String(parsed.naiResponse || "Terima kasih sudah menjelaskan!"),
            feedbackForTeacher: String(parsed.feedbackForTeacher || "Penjelasanmu sangat mendalam."),
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
          };
        }
      } catch {
        // fallback
      }
    }

    return this.fallback.evaluateTeachMode(context, options);
  }

  async *evaluateTeachModeStream(
    context: AiTeachContext,
    options?: AiChatOptions
  ): AsyncIterable<AiTeachChunk> {
    yield {
      type: "thought",
      content: "Nai sedang menelaah dan mencerna konsep yang diajarkan...",
    };

    const evaluation = await this.evaluateTeachMode(context, options);
    const words = evaluation.naiResponse.split(/(\s+)/);
    for (const w of words) {
      if (w) {
        yield { type: "nai_response", content: w };
        await new Promise((r) => setTimeout(r, 15));
      }
    }

    yield {
      type: "evaluation",
      evaluation,
    };

    yield {
      type: "done",
      provider: "gemma",
      model: this.getModelName(options),
    };
  }

  async evaluatePrediction(
    context: AiPredictContext,
    options?: AiChatOptions
  ): Promise<AiPredictAnalysis> {
    const apiKey = this.getApiKey(options);
    const localEndpoint = this.getLocalEndpoint(options);
    const modelName = this.getModelName(options);

    // 1. Try Google Generative API with JSON mode
    if (apiKey) {
      try {
        const text = await this.callGoogleApi(
          NAI_PREDICT_SYSTEM_PROMPT,
          [{ role: "user", content: buildPredictPrompt(context) }],
          apiKey,
          modelName,
          true
        );

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            hypothesisEvaluation: String(
              parsed.hypothesisEvaluation ||
                (context.isCorrect
                  ? "Hipotesismu tepat dan selaras dengan prinsip konsep ini."
                  : "Hipotesismu menarik, namun fenomena aslinya memiliki karakteristik berbeda.")
            ),
            cognitiveAnalysis: String(
              parsed.cognitiveAnalysis ||
                "Penalaranmu menunjukkan proses berpikir aktif dalam memprediksi variabel sebelum pembuktian."
            ),
            conceptualNudge: String(
              parsed.conceptualNudge ||
                "Perhatikan pembuktian dan visualisasi di langkah berikutnya untuk menguji intuisimu!"
            ),
            misconceptionAlert: parsed.misconceptionAlert
              ? String(parsed.misconceptionAlert)
              : undefined,
            provider: "gemma",
            model: modelName,
          };
        }
      } catch (err) {
        console.warn("Gemma evaluatePrediction API notice:", err);
        const parsed = parseAiError(err, modelName);
        if (parsed.isRateLimit) {
          const fallbackRes = await this.fallback.evaluatePrediction(context, options);
          return {
            ...fallbackRes,
            notice: `⚠️ Kuota atau batas request model ${modelName} sedang penuh (HTTP 429). Menampilkan analisis nalar terkurasi.`,
            model: `${modelName} (offline-curated)`,
          };
        }
      }
    }

    // 2. Try Local Ollama
    if (localEndpoint) {
      try {
        const messages: AiMessage[] = [
          { role: "system", content: NAI_PREDICT_SYSTEM_PROMPT },
          { role: "user", content: buildPredictPrompt(context) },
        ];
        const res = await this.chat(messages, options);
        const jsonMatch = res.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            hypothesisEvaluation: String(
              parsed.hypothesisEvaluation ||
                (context.isCorrect
                  ? "Hipotesismu tepat dan selaras dengan prinsip konsep ini."
                  : "Hipotesismu menarik, namun fenomena aslinya memiliki karakteristik berbeda.")
            ),
            cognitiveAnalysis: String(
              parsed.cognitiveAnalysis ||
                "Penalaranmu menunjukkan proses berpikir aktif dalam memprediksi variabel sebelum pembuktian."
            ),
            conceptualNudge: String(
              parsed.conceptualNudge ||
                "Perhatikan pembuktian dan visualisasi di langkah berikutnya untuk menguji intuisimu!"
            ),
            misconceptionAlert: parsed.misconceptionAlert
              ? String(parsed.misconceptionAlert)
              : undefined,
            provider: "gemma",
            model: modelName,
          };
        }
      } catch {
        // fallback
      }
    }

    return this.fallback.evaluatePrediction(context, options);
  }
}
