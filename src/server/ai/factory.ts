import { IAiProvider, AiProviderName } from "./types";
import { GemmaProvider } from "./providers/gemma-provider";
import { GoogleGeminiProvider } from "./providers/google-provider";
import { OpenAiProvider } from "./providers/openai-provider";
import { AnthropicProvider } from "./providers/anthropic-provider";
import { CuratedLocalProvider } from "./providers/curated-provider";

export interface ModelOption {
  id: string;
  name: string;
  badge?: string;
}

export interface ProviderCatalogItem {
  id: AiProviderName;
  name: string;
  defaultModel: string;
  availableModels: string[];
  models: ModelOption[];
  hasApiKey: boolean;
  available: boolean;
  description: string;
  isDefault?: boolean;
}

export function getAiProvidersCatalog(): ProviderCatalogItem[] {
  const hasGemmaKey = Boolean(
    process.env.GEMMA_API_KEY ||
    process.env.GEMMA_ENDPOINT ||
    process.env.AI_API_KEY
  );
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY
  );
  const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);
  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);

  return [
    {
      id: "gemma",
      name: "Google Gemma",
      defaultModel: process.env.GEMMA_MODEL || "gemma-4-31b-it",
      availableModels: ["gemma-4-31b-it", "gemma-4-26b-it"],
      models: [
        { id: "gemma-4-31b-it", name: "Gemma 4 31B IT", badge: "Utama" },
        { id: "gemma-4-26b-it", name: "Gemma 4 26B IT" },
      ],
      hasApiKey: hasGemmaKey,
      available: true,
      description: "Model open-weights efisien dari Google DeepMind dengan penalaran terarah untuk sains dan matematika.",
      isDefault: true,
    },
    {
      id: "google",
      name: "Google Gemini",
      defaultModel: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      availableModels: [
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-3.6-flash",
        "gemini-3.7-flash",
        "gemini-3.8-flash",
      ],
      models: [
        { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite" },
        { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite" },
        { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", badge: "Cepat" },
        { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash" },
        { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash" },
        { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash" },
      ],
      hasApiKey: hasGeminiKey,
      available: hasGeminiKey, // Hanya aktif jika API key Gemini diset
      description: "Model multimodal Google berkecepatan tinggi dengan pemahaman konteks luas dan latensi rendah.",
    },
    {
      id: "openai",
      name: "OpenAI GPT",
      defaultModel: "gpt-4o-mini",
      availableModels: ["gpt-4o-mini", "gpt-4o"],
      models: [
        { id: "gpt-4o-mini", name: "GPT-4o Mini" },
        { id: "gpt-4o", name: "GPT-4o" },
      ],
      hasApiKey: hasOpenAiKey,
      available: hasOpenAiKey,
      description: "Keluarga model GPT OpenAI untuk penalaran instruksional dan penjelasan konsep.",
    },
    {
      id: "anthropic",
      name: "Anthropic Claude",
      defaultModel: "claude-3-5-haiku-20241022",
      availableModels: ["claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022"],
      models: [
        { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
        { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
      ],
      hasApiKey: hasAnthropicKey,
      available: hasAnthropicKey,
      description: "Model cerdas Anthropic dengan gaya komunikasi Socratic yang hangat dan nuansa mendalam.",
    },
    {
      id: "curated",
      name: "Mode Offline Terkurasi (Lokal)",
      defaultModel: "curated-socratic-engine",
      availableModels: ["curated-socratic-engine"],
      models: [
        { id: "curated-socratic-engine", name: "Kurasi Lokal (100% Offline)" },
      ],
      hasApiKey: true,
      available: true,
      description: "Mesin penalaran deterministik 100% offline tanpa kuota atau dependensi internet.",
    },
  ];
}

export const AI_PROVIDERS_CATALOG: ProviderCatalogItem[] = getAiProvidersCatalog();

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
