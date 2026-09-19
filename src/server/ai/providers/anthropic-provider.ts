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
import Anthropic from "@anthropic-ai/sdk";
import { transformThinkTags } from "../stream-utils";

export class AnthropicProvider implements IAiProvider {
  public readonly name = "anthropic" as const;
  private readonly fallback = new CuratedLocalProvider();

  private getApiKey(options?: AiChatOptions): string | undefined {
    return options?.apiKey || process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY;
  }

  private getModelName(options?: AiChatOptions): string {
    return options?.model || process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022";
  }

  private getEndpoint(options?: AiChatOptions): string | undefined {
    return options?.endpoint || process.env.ANTHROPIC_BASE_URL || process.env.ANTHROPIC_ENDPOINT;
  }

  async chat(messages: AiMessage[], options?: AiChatOptions): Promise<AiChatResponse> {
    const apiKey = this.getApiKey(options);
    const modelName = this.getModelName(options);
    const baseURL = this.getEndpoint(options);

    if (apiKey) {
      try {
        const client = new Anthropic({ apiKey, baseURL: baseURL || undefined });
        const systemMsg = messages.find((m) => m.role === "system")?.content;
        const nonSystemMsgs = messages
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

        const res = await client.messages.create({
          model: modelName,
          max_tokens: options?.maxTokens ?? 1024,
          system: systemMsg,
          messages: nonSystemMsgs.length > 0 ? nonSystemMsgs : [{ role: "user", content: "Halo" }],
          temperature: options?.temperature ?? 0.7,
        });

        const firstBlock = res.content[0];
        const text = firstBlock?.type === "text" ? firstBlock.text : "";

        return {
          text,
          provider: "anthropic",
          model: modelName,
          tokensUsed: (res.usage?.input_tokens ?? 0) + (res.usage?.output_tokens ?? 0),
        };
      } catch {
        // Fallback
      }
    }

    const fallbackRes = await this.fallback.chat(messages, options);
    return {
      ...fallbackRes,
      provider: "anthropic",
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
      provider: "anthropic",
      model: "claude-3-5-haiku (offline-curated)",
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
        const client = new Anthropic({ apiKey, baseURL: baseURL || undefined });
        const systemMsg = messages.find((m) => m.role === "system")?.content;
        const nonSystemMsgs = messages
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

        const stream = client.messages.stream({
          model: modelName,
          max_tokens: options?.maxTokens ?? 1024,
          system: systemMsg,
          messages: nonSystemMsgs.length > 0 ? nonSystemMsgs : [{ role: "user", content: "Halo" }],
          temperature: options?.temperature ?? 0.7,
        });

        async function* readAnthropicStream(): AsyncGenerator<string> {
          for await (const event of stream) {
            if (event.type === "content_block_delta") {
              const delta = event.delta as { type?: string; text?: string; thinking?: string };
              if (delta.type === "text_delta" && delta.text) {
                yield delta.text;
              } else if (delta.type === "thinking_delta" && delta.thinking) {
                yield `<think>${delta.thinking}</think>`;
              }
            }
          }
        }

        for await (const chunk of transformThinkTags(readAnthropicStream())) {
          yield { ...chunk, provider: "anthropic", model: modelName };
        }
        yield { type: "done", provider: "anthropic", model: modelName };
        return;
      } catch {
        // Fallback
      }
    }

    for await (const chunk of this.fallback.socraticGuidanceStream(context, options)) {
      yield {
        ...chunk,
        provider: "anthropic",
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
            naiResponse: String(parsed.naiResponse || "Terima kasih, Nai mengerti sekarang!"),
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

  async evaluatePrediction(
    context: AiPredictContext,
    options?: AiChatOptions
  ): Promise<AiPredictAnalysis> {
    return this.fallback.evaluatePrediction(context, options);
  }
}
