"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bot, Settings, X, Lightbulb, HelpCircle, BookOpen, Send } from "lucide-react";
import { MathRenderer } from "@/components/ui/katex-math";
import { AiProviderName } from "@/server/ai/types";

interface NaiTutorDrawerProps {
  conceptSlug: string;
  stepId?: string;
  stepTitle?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "nai";
  text: string;
  provider?: string;
  model?: string;
}

export function NaiTutorDrawer({ conceptSlug, stepId, stepTitle }: NaiTutorDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AiProviderName>("gemma");
  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "nai",
      text: `Halo! Aku **Nai**, pemandumu di Nalar. Aku di sini untuk membantu proses berpikirmu tanpa membocorkan jawaban langsung. Ada bagian yang membuatmu penasaran pada langkah **${stepTitle || "ini"}**?`,
    },
  ]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = { id: userMsgId, sender: "user", text: q };
    setMessages((prev) => [...prev, newMsg]);
    setInputQuestion("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptSlug,
          stepId,
          userQuestion: q,
          provider: selectedProvider,
          apiKey: customKey || undefined,
          endpoint: customEndpoint || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: `nai-${Date.now()}`,
            sender: "nai",
            text: json.data.answer,
            provider: json.data.provider,
            model: json.data.model,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `nai-err-${Date.now()}`,
            sender: "nai",
            text: "Maaf, Nai sedang kesulitan memproses pesanmu. Tapi jangan menyerah, coba periksa kembali petunjuk di layar ya!",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `nai-err-${Date.now()}`,
          sender: "nai",
          text: "Koneksi ke Nai terputus sementara. Kamu tetap bisa membuka petunjuk bergradasi 4-layer di atas!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Mascot Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Buka AI Tutor Nai"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-accent text-surface-raised font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all border border-accent-subtle"
      >
        <Bot className="w-5 h-5" />
        <span>Tanya Nai</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </button>

      {/* Slide-out Drawer mounted directly on document.body */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full sm:w-[420px] h-full bg-surface-raised border-l border-border flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
            role="dialog"
            aria-label="Panel Nai AI Socratic Tutor"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent shadow-xs">
                  <Bot className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-text flex items-center gap-1.5">
                    <span>Nai</span>
                    <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">
                      Socratic Tutor
                    </span>
                  </h3>
                  <p className="text-[11px] text-text-muted">Membimbing penalaran mandiri</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowConfig(!showConfig)}
                  className="p-2 rounded-lg border border-border text-text-muted hover:text-text hover:bg-surface text-xs transition-colors"
                  title="Pengaturan Provider LLM"
                  aria-label="Pengaturan Provider LLM"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg border border-border text-text-muted hover:text-text hover:bg-surface text-xs transition-colors"
                  aria-label="Tutup panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Provider & Model Config Bar */}
            <div className="px-4 py-2.5 bg-surface-raised border-b border-border-subtle text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-muted">Mesin AI:</span>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value as AiProviderName)}
                  className="px-2 py-1 rounded bg-surface border border-border text-[11px] text-text focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="gemma">Google Gemma (Default)</option>
                  <option value="google">Google Gemini</option>
                  <option value="openai">OpenAI GPT</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="curated">Mode Offline Terkurasi</option>
                </select>
              </div>

              {showConfig && (
                <div className="p-3 rounded-lg bg-surface border border-border space-y-2 text-[11px] animate-in fade-in">
                  <div>
                    <label className="text-text-muted block mb-0.5">Kunci API Kustom (Opsional):</label>
                    <input
                      type="password"
                      placeholder="Masukkan API Key jika ada..."
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-surface-raised border border-border text-text placeholder-text-muted"
                    />
                  </div>
                  <div>
                    <label className="text-text-muted block mb-0.5">Endpoint URL / Ollama (Opsional):</label>
                    <input
                      type="text"
                      placeholder="http://localhost:11434"
                      value={customEndpoint}
                      onChange={(e) => setCustomEndpoint(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-surface-raised border border-border text-text placeholder-text-muted"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-accent text-surface-raised rounded-br-2xs"
                        : "bg-surface border border-border text-text rounded-bl-2xs shadow-2xs"
                    }`}
                  >
                    <MathRenderer content={msg.text} />
                  </div>
                  {msg.model && (
                    <span className="text-[10px] text-text-muted mt-1 px-1 font-mono">
                      {msg.model}
                    </span>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface border border-border text-xs text-text-muted max-w-[70%]">
                  <Bot className="w-4 h-4 text-accent animate-pulse" />
                  <span>Nai sedang memikirkan petunjuk pemantik...</span>
                </div>
              )}
            </div>

            {/* Quick Socratic Suggestions */}
            <div className="px-4 py-2 border-t border-border-subtle bg-surface/50 flex flex-wrap gap-1.5">
              {[
                { icon: Lightbulb, text: "Beri petunjuk arah" },
                { icon: HelpCircle, text: "Mengapa prediksiku keliru?" },
                { icon: BookOpen, text: "Berikan analogi nyata" },
              ].map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => handleSend(text)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-surface hover:bg-surface-raised border border-border text-text-muted hover:text-text transition-colors"
                >
                  <Icon className="w-3 h-3 text-accent shrink-0" />
                  <span>{text}</span>
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-border bg-surface flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Tanyakan kebingunganmu pada Nai..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-surface-raised border border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-surface-raised font-bold text-xs hover:bg-accent-hover transition-colors disabled:opacity-40 shadow-xs"
              >
                <span>Kirim</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
