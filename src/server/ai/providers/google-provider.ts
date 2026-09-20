import {
  IAiProvider,
  AiMessage,
  AiChatOptions,
  AiChatResponse,
  AiSocraticContext,
  AiTeachContext,
  AiTeachEvaluation,
  AiChatChunk,
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
import { parseAiError } from "../error-utils";
import { sanitizeGoogleContents } from "../stream-utils";

export class GoogleGeminiProvider implements IAiProvider {
  public readonly name = "google" as const;
  private readonly fallback = new CuratedLocalProvider();

  private getApiKey(options?: AiChatOptions): string | undefined {
    return (
      options?.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.AI_API_KEY
    );
  }

  private getModelName(options?: AiChatOptions): string {
    return options?.model || process.env.GEMINI_MODEL || "gemini-3.5-flash";
  }

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
      throw new Error(`Google Gemini API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const textParts = parts.filter((p: { thought?: boolean; text?: string }) => !p.thought && p.text);
    const cleanText = textParts.map((p: { text: string }) => p.text).join("");
    return cleanText || parts.map((p: { text?: string }) => p.text || "").join("");
  }

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
      throw new Error(`Google Gemini API error (${res.status}): ${errText}`);
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
              throw new Error(`Google Gemini API stream error (${data.error.code}): ${data.error.message}`);
            }
            const parts = data.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
              if (part.thought && part.text) {
                yield { type: "thought", content: part.text, provider: "google", model: modelName };
              } else if (part.text) {
                yield { type: "text", content: part.text, provider: "google", model: modelName };
              }
            }
          } catch (e) {
            if (e instanceof Error && e.message.includes("Google Gemini API stream error")) throw e;
          }
        }
      }
    }
  }

  async chat(messages: AiMessage[], options?: AiChatOptions): Promise<AiChatResponse> {
    const apiKey = this.getApiKey(options);
    const modelName = this.getModelName(options);

    if (apiKey) {
      try {
        const systemMessage = messages.find((m) => m.role === "system");
        const dialogue = messages.filter((m) => m.role !== "system");
        const text = await this.callGoogleApi(
          systemMessage?.content,
          dialogue,
          apiKey,
          modelName
        );
        return {
          text,
          provider: "google",
          model: modelName,
        };
      } catch {
        // Fallback to curated
      }
    }

    const fallbackRes = await this.fallback.chat(messages, options);
    return {
      ...fallbackRes,
      provider: "google",
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

    if (this.getApiKey(options)) {
      try {
        return await this.chat(messages, options);
      } catch {
        // fallback
      }
    }

    const fallbackRes = await this.fallback.socraticGuidance(context, options);
    return {
      ...fallbackRes,
      provider: "google",
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
    const modelName = this.getModelName(options);

    if (apiKey) {
      let hasEmittedChunks = false;
      try {
        for await (const chunk of this.streamFromGoogleApi(systemPrompt, messages, apiKey, modelName)) {
          hasEmittedChunks = true;
          yield chunk;
        }
        yield { type: "done", provider: "google", model: modelName };
        return;
      } catch (err) {
        console.warn("GoogleGeminiProvider stream notice:", err);
        if (hasEmittedChunks) {
          yield { type: "done", provider: "google", model: modelName };
          return;
        }
        const parsed = parseAiError(err, modelName);
        if (parsed.isRateLimit) {
          yield {
            type: "notice",
            content: `⚠️ Batas kuota atau request model ${modelName} sedang penuh (HTTP 429). Nai beralih sementara ke respon terkurasi offline. Kamu juga dapat memilih model lain di pemilih model.`,
            code: parsed.code,
            provider: "google",
            model: `${modelName} (offline-curated)`,
          };
        }
      }
    }

    for await (const chunk of this.fallback.socraticGuidanceStream(context, options)) {
      yield {
        ...chunk,
        provider: "google",
        model: `${modelName} (offline-curated)`,
      };
    }
  }

  async evaluateTeachMode(
    context: AiTeachContext,
    options?: AiChatOptions
  ): Promise<AiTeachEvaluation> {
    const apiKey = this.getApiKey(options);
    const modelName = this.getModelName(options);

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
            feedbackForTeacher: String(parsed.feedbackForTeacher || "Penjelasanmu sangat bagus."),
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
          };
        }
      } catch (err) {
        console.warn("Google Gemini evaluateTeachMode API notice:", err);
      }
    }

    return this.fallback.evaluateTeachMode(context, options);
  }

  async evaluatePrediction(
    context: AiPredictContext,
    options?: AiChatOptions
  ): Promise<AiPredictAnalysis> {
    const apiKey = this.getApiKey(options);
    const modelName = this.getModelName(options);

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
            provider: "google",
            model: modelName,
          };
        }
      } catch (err) {
        console.warn("Google Gemini evaluatePrediction API notice:", err);
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

    return this.fallback.evaluatePrediction(context, options);
  }
}
