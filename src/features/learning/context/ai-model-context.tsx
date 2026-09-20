"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export interface ModelOption {
  id: string;
  name: string;
  badge?: string;
}

export interface ProviderItem {
  id: string;
  name: string;
  defaultModel: string;
  availableModels: string[];
  models?: ModelOption[];
  hasApiKey: boolean;
  available: boolean;
  description: string;
  isDefault?: boolean;
}

export interface SelectableModelItem {
  providerId: string;
  providerName: string;
  modelId: string;
  modelName: string;
  badge?: string;
}

interface AiModelContextValue {
  selectedProvider: string;
  selectedModel: string;
  setModel: (providerId: string, modelId: string) => void;
  availableProviders: ProviderItem[];
  selectableModels: SelectableModelItem[];
  activeModelLabel: string;
  activeProviderName: string;
  isLoading: boolean;
}

const STORAGE_PROVIDER_KEY = "nalar_selected_ai_provider";
const STORAGE_MODEL_KEY = "nalar_selected_ai_model";
const EVENT_MODEL_CHANGED = "nalar-ai-model-changed";

const DEFAULT_PROVIDER = "gemma";
const DEFAULT_MODEL = "gemma-4-31b-it";

const AiModelContext = createContext<AiModelContextValue>({
  selectedProvider: DEFAULT_PROVIDER,
  selectedModel: DEFAULT_MODEL,
  setModel: () => {},
  availableProviders: [],
  selectableModels: [],
  activeModelLabel: "Gemma 4 31B IT",
  activeProviderName: "Google Gemma",
  isLoading: true,
});

export function AiModelProvider({ children }: { children: React.ReactNode }) {
  const [selectedProvider, setSelectedProviderState] = useState<string>(DEFAULT_PROVIDER);
  const [selectedModel, setSelectedModelState] = useState<string>(DEFAULT_MODEL);
  const [availableProviders, setAvailableProviders] = useState<ProviderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch provider catalog on mount
  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const res = await fetch("/api/v1/ai/providers");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data?.providers) {
            const providers: ProviderItem[] = json.data.providers;
            setAvailableProviders(providers);

            // Read stored preferences
            const storedProvider = localStorage.getItem(STORAGE_PROVIDER_KEY);
            const storedModel = localStorage.getItem(STORAGE_MODEL_KEY);

            if (storedProvider && storedModel) {
              const matchedProvider = providers.find(
                (p) => p.id === storedProvider && p.available
              );
              if (matchedProvider) {
                const modelExists = matchedProvider.availableModels.includes(storedModel);
                if (modelExists) {
                  setSelectedProviderState(storedProvider);
                  setSelectedModelState(storedModel);
                  setIsLoading(false);
                  return;
                }
              }
            }

            // Fallback to server default
            const defProvider = json.data.defaultProvider || DEFAULT_PROVIDER;
            const defProviderObj = providers.find((p) => p.id === defProvider && p.available);
            if (defProviderObj) {
              setSelectedProviderState(defProviderObj.id);
              setSelectedModelState(defProviderObj.defaultModel);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load AI providers catalog:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCatalog();

    // Listen for cross-component or cross-tab synchronization
    const handleSync = (e: CustomEvent<{ providerId: string; modelId: string }> | StorageEvent) => {
      if ("detail" in e && e.detail) {
        setSelectedProviderState(e.detail.providerId);
        setSelectedModelState(e.detail.modelId);
      } else if ("key" in e && (e.key === STORAGE_PROVIDER_KEY || e.key === STORAGE_MODEL_KEY)) {
        const p = localStorage.getItem(STORAGE_PROVIDER_KEY) || DEFAULT_PROVIDER;
        const m = localStorage.getItem(STORAGE_MODEL_KEY) || DEFAULT_MODEL;
        setSelectedProviderState(p);
        setSelectedModelState(m);
      }
    };

    window.addEventListener(EVENT_MODEL_CHANGED as any, handleSync);
    window.addEventListener("storage", handleSync as any);

    return () => {
      isMounted = false;
      window.removeEventListener(EVENT_MODEL_CHANGED as any, handleSync);
      window.removeEventListener("storage", handleSync as any);
    };
  }, []);

  const setModel = useCallback((providerId: string, modelId: string) => {
    setSelectedProviderState(providerId);
    setSelectedModelState(modelId);

    try {
      localStorage.setItem(STORAGE_PROVIDER_KEY, providerId);
      localStorage.setItem(STORAGE_MODEL_KEY, modelId);
      window.dispatchEvent(
        new CustomEvent(EVENT_MODEL_CHANGED, {
          detail: { providerId, modelId },
        })
      );
    } catch {
      // Ignore in restricted environments
    }
  }, []);

  // Filter only available providers and flatten their models
  const selectableModels = useMemo<SelectableModelItem[]>(() => {
    const list: SelectableModelItem[] = [];
    for (const provider of availableProviders) {
      if (!provider.available) continue;
      if (provider.models && provider.models.length > 0) {
        for (const m of provider.models) {
          list.push({
            providerId: provider.id,
            providerName: provider.name,
            modelId: m.id,
            modelName: m.name,
            badge: m.badge,
          });
        }
      } else {
        for (const modelId of provider.availableModels) {
          list.push({
            providerId: provider.id,
            providerName: provider.name,
            modelId,
            modelName: modelId,
          });
        }
      }
    }
    return list;
  }, [availableProviders]);

  const activeModelLabel = useMemo(() => {
    const found = selectableModels.find(
      (m) => m.providerId === selectedProvider && m.modelId === selectedModel
    );
    if (found) return found.modelName;

    // Fallback format
    if (selectedModel === "gemma-4-31b-it") return "Gemma 4 31B IT";
    if (selectedModel === "gemma-4-26b-it") return "Gemma 4 26B IT";
    if (selectedModel === "gemini-3.1-flash-lite") return "Gemini 3.1 Flash Lite";
    if (selectedModel === "gemini-3.5-flash-lite") return "Gemini 3.5 Flash Lite";
    if (selectedModel === "gemini-3.5-flash") return "Gemini 3.5 Flash";
    if (selectedModel === "gemini-3.6-flash") return "Gemini 3.6 Flash";
    if (selectedModel === "gemini-3.7-flash") return "Gemini 3.7 Flash";
    if (selectedModel === "gemini-3.8-flash") return "Gemini 3.8 Flash";
    return selectedModel;
  }, [selectableModels, selectedProvider, selectedModel]);

  const activeProviderName = useMemo(() => {
    const found = availableProviders.find((p) => p.id === selectedProvider);
    return found ? found.name : selectedProvider;
  }, [availableProviders, selectedProvider]);

  const value = useMemo(
    () => ({
      selectedProvider,
      selectedModel,
      setModel,
      availableProviders,
      selectableModels,
      activeModelLabel,
      activeProviderName,
      isLoading,
    }),
    [
      selectedProvider,
      selectedModel,
      setModel,
      availableProviders,
      selectableModels,
      activeModelLabel,
      activeProviderName,
      isLoading,
    ]
  );

  return <AiModelContext.Provider value={value}>{children}</AiModelContext.Provider>;
}

export function useAiModel() {
  return useContext(AiModelContext);
}
