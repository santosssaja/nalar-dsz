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
  buildSocraticPrompt,
  buildTeachPrompt,
} from "../prompts";
import { CuratedLocalProvider } from "./curated-provider";
import OpenAI from "openai";
import { transformThinkTags } from "../stream-utils";

export class OpenAiProvider implements IAiProvider {
  public readonly name = "openai" as const;
  private readonly fallback = new CuratedLocalProvider();

  private getApiKey(options?: AiChatOptions): string | undefined {
    return options?.apiKey || process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  }

  private getModelName(options?: AiChatOptions): string {
    return options?.model || process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  private getEndpoint(options?: AiChatOptions): string | undefined {
    return options?.endpoint || process.env.OPENAI_BASE_URL || process.env.OPENAI_ENDPOINT;
  }

  async chat(messages: AiMessage[], options?: AiChatOptions): Promise<AiChatResponse> {
    const apiKey = this.getApiKey(options);
    const modelName = this.getModelName(options);
    const baseURL = this.getEndpoint(options);

    if (apiKey) {
      try {
        const client = new OpenAI({ apiKey, baseURL: baseURL || undefined });
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

  async *socraticGuidanceStream(
    context: AiSocraticContext,
    options?: AiChatOptions
  ): AsyncIterable<AiChatChunk> {
    const messages: AiMessage[] = [
      { role: "system", content: NAI_SOCRATIC_SYSTEM_PROMPT },
      ...(context.recentChatHistory || []),
      { role: "user", content: buildSocraticPrompt(context) },
    ];

    const apiKey = this.getApiKey(options);
    const modelName = this.getModelName(options);
    const baseURL = this.getEndpoint(options);

    if (apiKey) {
      try {
        const client = new OpenAI({ apiKey, baseURL: baseURL || undefined });
        const stream = await client.chat.completions.create({
          model: modelName,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: options?.temperature ?? 0.7,
          stream: true,
        });

        async function* readOpenAiStream(): AsyncGenerator<string> {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta as {
              content?: string | null;
              reasoning_content?: string | null;
            } | undefined;

            if (delta?.reasoning_content) {
              yield `<think>${delta.reasoning_content}</think>`;
            } else if (delta?.content) {
              yield delta.content;
            }
          }
        }

        for await (const chunk of transformThinkTags(readOpenAiStream())) {
          yield { ...chunk, provider: "openai", model: modelName };
        }
        yield { type: "done", provider: "openai", model: modelName };
        return;
      } catch {
        // Fallback
      }
    }

    for await (const chunk of this.fallback.socraticGuidanceStream(context, options)) {
      yield {
        ...chunk,
        provider: "openai",
        model: `${modelName} (offline-curated)`,
      };
    }
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

  async evaluatePrediction(
    context: AiPredictContext,
    options?: AiChatOptions
  ): Promise<AiPredictAnalysis> {
    return this.fallback.evaluatePrediction(context, options);
  }
}
