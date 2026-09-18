import {
  IAiProvider,
  AiMessage,
  AiChatOptions,
  AiChatResponse,
  AiSocraticContext,
  AiTeachContext,
  AiTeachEvaluation,
} from "../types";
import {
  NAI_SOCRATIC_SYSTEM_PROMPT,
  NAI_TEACH_MODE_SYSTEM_PROMPT,
  buildSocraticPrompt,
  buildTeachPrompt,
} from "../prompts";
import { CuratedLocalProvider } from "./curated-provider";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GemmaProvider implements IAiProvider {
  public readonly name = "gemma" as const;
  private readonly fallback = new CuratedLocalProvider();

  private getApiKey(options?: AiChatOptions): string | undefined {
    return options?.apiKey || process.env.GEMMA_API_KEY || process.env.GEMINI_API_KEY;
  }

  private getModelName(options?: AiChatOptions): string {
    return options?.model || process.env.GEMMA_MODEL || "gemma-2-9b-it";
  }

  private getLocalEndpoint(options?: AiChatOptions): string | undefined {
    return options?.endpoint || process.env.GEMMA_ENDPOINT; // e.g. "http://localhost:11434"
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
        // Fall through to next method
      }
    }

    // 2. Try Google AI Studio with Gemma model if API key is present
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
        const result = await model.generateContent(prompt);
        const text = result.response.text();
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
      model: "gemma-2-9b-it (offline-curated)",
    };
  }

  async evaluateTeachMode(
    context: AiTeachContext,
    options?: AiChatOptions
  ): Promise<AiTeachEvaluation> {
    const apiKey = this.getApiKey(options);
    const localEndpoint = this.getLocalEndpoint(options);

    if (apiKey || localEndpoint) {
      try {
        const messages: AiMessage[] = [
          { role: "system", content: NAI_TEACH_MODE_SYSTEM_PROMPT },
          { role: "user", content: buildTeachPrompt(context) },
        ];
        const res = await this.chat(messages, options);

        // Try parsing JSON response from LLM
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
        // fallback to curated
      }
    }

    return this.fallback.evaluateTeachMode(context, options);
  }
}
