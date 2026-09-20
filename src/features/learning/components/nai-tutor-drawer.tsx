"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Lightbulb, HelpCircle, BookOpen, Send, ChevronDown, Sparkles, Info } from "lucide-react";
import Image from "next/image";
import { useAiModel } from "@/features/learning/context/ai-model-context";
import { ChatMessage, NaiChatMessageItem } from "./nai-chat-message";

interface NaiTutorDrawerProps {
  conceptSlug: string;
  stepId?: string;
  stepTitle?: string;
}

export function NaiTutorDrawer({ conceptSlug, stepId, stepTitle }: NaiTutorDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const {
    selectedProvider,
    selectedModel,
    setModel,
    availableProviders,
    activeModelLabel,
  } = useAiModel();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "nai",
      text: `Halo! Aku **Nai**, pemandumu di Nalar. Aku di sini untuk membantu proses berpikirmu tanpa membocorkan jawaban langsung. Ada bagian yang membuatmu penasaran pada langkah **${stepTitle || "ini"}**?`,
    },
  ]);

  // Scroll to bottom when messages change or loading
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});

  const toggleThought = (messageId: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const naiMsgId = `nai-${Date.now()}`;
    // Extract previous conversation turns (up to 8 messages) for multi-turn conversational context
    const chatHistory = messages
      .filter((m) => m.id !== "welcome-1" && m.text.trim().length > 0 && !m.error)
      .slice(-8)
      .map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text.trim(),
      }));

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: "user", text: q },
      { id: naiMsgId, sender: "nai", text: "", thought: "", isStreaming: true, isThinking: true },
    ]);
    setInputQuestion("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/ai/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          conceptSlug,
          stepId,
          userQuestion: q,
          provider: selectedProvider,
          model: selectedModel,
          stream: true,
          chatHistory,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        const errorMsg =
          errorJson?.error?.message ||
          (typeof errorJson?.error === "string" ? errorJson.error : null) ||
          (res.status === 429
            ? "Batas kuota atau rate limit model sedang penuh (HTTP 429). Silakan tunggu sejenak atau beralih ke model lain di atas."
            : "Gagal menghubungi server tutor.");
        throw new Error(errorMsg);
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const events = sseBuffer.split("\n\n");
          sseBuffer = events.pop() || "";

          for (const event of events) {
            const trimmed = event.trim();
            if (!trimmed.startsWith("data:")) continue;
            const dataStr = trimmed.slice(5).trim();
            if (!dataStr) continue;

            try {
              const chunk = JSON.parse(dataStr);
              if (chunk.type === "thought") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === naiMsgId
                      ? {
                          ...m,
                          thought: (m.thought || "") + (chunk.content || ""),
                          isThinking: true,
                        }
                      : m
                  )
                );
              } else if (chunk.type === "text") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === naiMsgId
                      ? {
                          ...m,
                          text: (m.text || "") + (chunk.content || ""),
                          isThinking: false,
                        }
                      : m
                  )
                );
              } else if (chunk.type === "notice") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === naiMsgId
                      ? {
                          ...m,
                          notice: chunk.content,
                        }
                      : m
                  )
                );
              } else if (chunk.type === "done") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === naiMsgId
                      ? {
                          ...m,
                          isStreaming: false,
                          isThinking: false,
                        }
                      : m
                  )
                );
              } else if (chunk.type === "error") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === naiMsgId
                      ? {
                          ...m,
                          error: chunk.content || "Terjadi kendala pada model AI.",
                          text: m.text ? m.text : (chunk.content || "Terjadi kendala pada model AI."),
                          isStreaming: false,
                          isThinking: false,
                        }
                      : m
                  )
                );
              }
            } catch {
              // Ignore malformed chunk
            }
          }
        }
      } else {
        // Fallback for non-streaming response
        const json = await res.json();
        if (json.data?.answer) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === naiMsgId
                ? {
                    ...m,
                    text: json.data.answer,
                    isStreaming: false,
                    isThinking: false,
                  }
                : m
            )
          );
        }
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Koneksi ke Nai terputus sementara. Kamu tetap bisa membuka petunjuk bergradasi 4-layer di atas!";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === naiMsgId
            ? {
                ...m,
                error: errorMsg,
                text: m.text ? m.text : errorMsg,
                isStreaming: false,
                isThinking: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === naiMsgId
            ? {
                ...m,
                isStreaming: false,
                isThinking: false,
              }
            : m
        )
      );
    }
  };

  return (
    <>
      {/* Floating Mascot Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Buka AI Tutor Nai"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-accent text-surface-raised font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all border border-accent-subtle"
      >
        <Image
          src="/figma-assets/logo-nalar.webp"
          alt="Avatar Nai"
          width={22}
          height={22}
          className="w-5 h-5 object-contain shrink-0"
        />
        <span>Tanya Nai</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Slide-out Companion Panel mounted directly on document.body */}
      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-50 flex justify-end pointer-events-auto"
          role="dialog"
          aria-label="Panel Nai AI Socratic Tutor"
        >
          {/* Subtle click-outside backdrop without blur - keeps page sharp and clear */}
          <div
            className="fixed inset-0 bg-black/15 transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Integrated Sliding Companion Panel */}
          <div
            className="relative z-10 w-full sm:w-[420px] md:w-[460px] h-full bg-surface-raised border-l border-border sm:rounded-l-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-xs">
                  <Image
                    src="/figma-assets/logo-nalar.webp"
                    alt="Nai"
                    width={28}
                    height={28}
                    className="w-full h-full object-contain"
                  />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-text flex items-center gap-1.5">
                    <span>Nai</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                      Teman Belajar Sokratis
                    </span>
                  </h3>
                  <p className="text-[11px] text-text-muted">Membimbing alur berpikir mandiri</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl border border-border text-text-muted hover:text-text hover:bg-surface text-xs transition-colors"
                aria-label="Tutup panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Model Selector Bar */}
            <div className="px-4 py-2 bg-surface-raised border-b border-border space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-text-muted shrink-0 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[11px]">Model:</span>
                </div>

                <div className="relative flex-1 max-w-[280px]">
                  <select
                    value={`${selectedProvider}:${selectedModel}`}
                    onChange={(e) => {
                      const [prov, mod] = e.target.value.split(":");
                      if (prov && mod) setModel(prov, mod);
                    }}
                    className="w-full text-[11px] font-medium py-1.5 pl-2.5 pr-7 rounded-lg bg-surface border border-border text-text hover:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent transition-colors appearance-none cursor-pointer truncate shadow-xs"
                    aria-label="Pilih Model AI"
                  >
                    {availableProviders.map((provider) => {
                      if (!provider.available) return null;
                      return (
                        <optgroup key={provider.id} label={provider.name}>
                          {provider.models && provider.models.length > 0
                            ? provider.models.map((m) => (
                                <option key={`${provider.id}:${m.id}`} value={`${provider.id}:${m.id}`}>
                                  {m.name} {m.badge ? `(${m.badge})` : ""}
                                </option>
                              ))
                            : provider.availableModels.map((mId) => (
                                <option key={`${provider.id}:${mId}`} value={`${provider.id}:${mId}`}>
                                  {mId}
                                </option>
                              ))}
                        </optgroup>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Server Speed Info Notice */}
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted/80">
                <Info className="w-3 h-3 text-accent shrink-0" />
                <span>Kecepatan respons LLM bergantung pada beban server penyedia.</span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {messages.map((msg) => (
                <NaiChatMessageItem
                  key={msg.id}
                  message={msg}
                  isThoughtExpanded={expandedThoughts[msg.id] ?? Boolean(msg.isThinking)}
                  onToggleThought={toggleThought}
                />
              ))}

              {isLoading && messages[messages.length - 1]?.sender === "user" && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface border border-border text-xs text-text-muted max-w-[75%] shadow-2xs">
                  <Image
                    src="/figma-assets/logo-nalar.webp"
                    alt=""
                    width={18}
                    height={18}
                    className="w-4 h-4 object-contain animate-pulse shrink-0"
                  />
                  <span>Nai sedang memikirkan petunjuk pemantik...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Socratic Suggestions */}
            <div className="px-4 py-2.5 border-t border-border bg-surface/60 flex flex-wrap gap-1.5">
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
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] bg-surface hover:bg-surface-raised border border-border text-text-muted hover:text-text transition-colors shadow-2xs disabled:opacity-50"
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
              className="p-3.5 border-t border-border bg-surface flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Tanyakan kebingunganmu pada Nai..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-surface-raised border border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isLoading}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-surface-raised font-bold text-xs hover:bg-accent-hover transition-colors disabled:opacity-40 shadow-xs"
              >
                <span>Kirim</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
