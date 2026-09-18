export type AiProviderName = "gemma" | "google" | "openai" | "anthropic" | "curated";

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiChatOptions {
  provider?: AiProviderName;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  endpoint?: string;
}

export interface AiChatResponse {
  text: string;
  provider: AiProviderName;
  model: string;
  tokensUsed?: number;
}

export interface AiSocraticContext {
  conceptSlug: string;
  conceptTitle: string;
  stepKind: string;
  stepTitle: string;
  stepInstruction: string;
  stepContent: string;
  userQuestion: string;
  misconceptions?: Array<{ code: string; label: string; remediation: string }>;
  recentChatHistory?: AiMessage[];
}

export interface AiTeachContext {
  conceptSlug: string;
  conceptTitle: string;
  conceptSummary: string;
  userTeachingExplanation: string;
  naiQuestion: string;
  rubricCriteria?: Array<{ id: string; name: string; description: string }>;
}

export interface AiTeachEvaluation {
  understood: boolean;
  score: number; // 0 - 100
  naiResponse: string; // persona response from Nai
  feedbackForTeacher: string; // constructive feedback for learner
  suggestions: string[];
}

export interface AiChatChunk {
  type: "thought" | "text" | "done" | "error";
  content?: string;
  provider?: AiProviderName;
  model?: string;
}

export interface IAiProvider {
  readonly name: AiProviderName;
  chat(messages: AiMessage[], options?: AiChatOptions): Promise<AiChatResponse>;
  socraticGuidance(context: AiSocraticContext, options?: AiChatOptions): Promise<AiChatResponse>;
  socraticGuidanceStream?(
    context: AiSocraticContext,
    options?: AiChatOptions
  ): AsyncIterable<AiChatChunk>;
  evaluateTeachMode(context: AiTeachContext, options?: AiChatOptions): Promise<AiTeachEvaluation>;
}
