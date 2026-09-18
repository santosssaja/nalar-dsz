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

export class GoogleGeminiProvider implements IAiProvider {
  public readonly name = "google" as const;
  private readonly fallback = new CuratedLocalProvider();

  private getApiKey(options?: AiChatOptions): string | undefined {
    return options?.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  }

  private getModelName(options?: AiChatOptions): string {
    return options?.model || process.env.GEMINI_MODEL || "gemini-1.5-flash";
  }

  async chat(messages: AiMessage[], options?: AiChatOptions): Promise<AiChatResponse> {
    const apiKey = this.getApiKey(options);
    const modelName = this.getModelName(options);

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
        const result = await model.generateContent(prompt);
        return {
          text: result.response.text(),
          provider: "google",
          model: modelName,
        };
      } catch {
        // Fallback
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
      model: "gemini-1.5-flash (offline-curated)",
    };
  }

  async evaluateTeachMode(
    context: AiTeachContext,
    options?: AiChatOptions
  ): Promise<AiTeachEvaluation> {
    if (this.getApiKey(options)) {
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
            naiResponse: String(parsed.naiResponse || "Terima kasih atas penjelasannya!"),
            feedbackForTeacher: String(parsed.feedbackForTeacher || "Penjelasanmu sangat bagus."),
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
          };
        }
      } catch {
        // fallback
      }
    }

    return this.fallback.evaluateTeachMode(context, options);
  }
}
