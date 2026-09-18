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
import OpenAI from "openai";

export class OpenAiProvider implements IAiProvider {
  public readonly name = "openai" as const;
  private readonly fallback = new CuratedLocalProvider();

  private getApiKey(options?: AiChatOptions): string | undefined {
    return options?.apiKey || process.env.OPENAI_API_KEY;
  }

  private getModelName(options?: AiChatOptions): string {
    return options?.model || process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  async chat(messages: AiMessage[], options?: AiChatOptions): Promise<AiChatResponse> {
    const apiKey = this.getApiKey(options);
    const modelName = this.getModelName(options);

    if (apiKey) {
      try {
        const client = new OpenAI({ apiKey, baseURL: options?.endpoint });
        const res = await client.chat.completions.create({
          model: modelName,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: options?.temperature ?? 0.7,
        });

        return {
          text: res.choices[0]?.message?.content ?? "",
          provider: "openai",
          model: modelName,
          tokensUsed: res.usage?.total_tokens,
        };
      } catch {
        // Fallback
      }
    }

    const fallbackRes = await this.fallback.chat(messages, options);
    return {
      ...fallbackRes,
      provider: "openai",
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
      provider: "openai",
      model: "gpt-4o-mini (offline-curated)",
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
            naiResponse: String(parsed.naiResponse || "Wah, Nai paham sekarang!"),
            feedbackForTeacher: String(parsed.feedbackForTeacher || "Penjelasanmu jernih."),
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
