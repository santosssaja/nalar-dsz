import { IAiProvider, AiProviderName } from "./types";
import { GemmaProvider } from "./providers/gemma-provider";
import { GoogleGeminiProvider } from "./providers/google-provider";
import { OpenAiProvider } from "./providers/openai-provider";
import { AnthropicProvider } from "./providers/anthropic-provider";
import { CuratedLocalProvider } from "./providers/curated-provider";

export interface ProviderCatalogItem {
  id: AiProviderName;
  name: string;
  defaultModel: string;
  availableModels: string[];
  description: string;
  isDefault?: boolean;
}

export const AI_PROVIDERS_CATALOG: ProviderCatalogItem[] = [
  {
    id: "gemma",
    name: "Google Gemma (Default)",
    defaultModel: "gemma-2-9b-it",
    availableModels: ["gemma-2-9b-it", "gemma-2-27b-it", "gemma-2-2b-it"],
    description: "Model open-weights efisien dan terarah dari Google DeepMind, dirancang untuk penalaran STEM.",
    isDefault: true,
  },
  {
    id: "google",
    name: "Google Gemini",
    defaultModel: "gemini-1.5-flash",
    availableModels: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"],
    description: "Model multimodal Google berkecepatan tinggi dengan pemahaman konteks panjang.",
  },
  {
    id: "openai",
    name: "OpenAI GPT",
    defaultModel: "gpt-4o-mini",
    availableModels: ["gpt-4o-mini", "gpt-4o"],
    description: "Keluarga model GPT OpenAI untuk penalaran instruksional dan penjelasan konsep.",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    defaultModel: "claude-3-5-haiku-20241022",
    availableModels: ["claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022"],
    description: "Model cerdas Anthropic dengan gaya komunikasi Socratic yang hangat dan nuansa mendalam.",
  },
  {
    id: "curated",
    name: "Mode Offline Terkurasi (Lokal)",
    defaultModel: "curated-socratic-engine",
    availableModels: ["curated-socratic-engine"],
    description: "Mesin penalaran deterministik 100% offline tanpa kuota atau dependensi internet.",
  },
];

export function resolveProviderName(raw?: string): AiProviderName {
  if (!raw) return "gemma";
  const lower = raw.toLowerCase().trim();
  if (lower === "gemini") return "google";
  if (lower === "mock" || lower === "none" || lower === "local") return "curated";
  if (["gemma", "google", "openai", "anthropic", "curated"].includes(lower)) {
    return lower as AiProviderName;
  }
  return "gemma";
}

const providersCache: Partial<Record<AiProviderName, IAiProvider>> = {};

export function getAiProvider(providerName?: AiProviderName): IAiProvider {
  // Default to Google Gemma or configured AI_DEFAULT_PROVIDER / AI_PROVIDER
  const target: AiProviderName =
    providerName ||
    resolveProviderName(process.env.AI_DEFAULT_PROVIDER || process.env.AI_PROVIDER);

  if (!providersCache[target]) {
    switch (target) {
      case "gemma":
        providersCache[target] = new GemmaProvider();
        break;
      case "google":
        providersCache[target] = new GoogleGeminiProvider();
        break;
      case "openai":
        providersCache[target] = new OpenAiProvider();
        break;
      case "anthropic":
        providersCache[target] = new AnthropicProvider();
        break;
      case "curated":
      default:
        providersCache[target] = new CuratedLocalProvider();
        break;
    }
  }

  return providersCache[target]!;
}
