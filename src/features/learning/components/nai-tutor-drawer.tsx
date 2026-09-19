"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Bot, X, Lightbulb, HelpCircle, BookOpen, Send, Brain, ChevronDown, ChevronUp } from "lucide-react";
import { MathRenderer } from "@/components/ui/katex-math";

interface NaiTutorDrawerProps {
  conceptSlug: string;
  stepId?: string;
  stepTitle?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "nai";
  text: string;
  thought?: string;
  isStreaming?: boolean;
  isThinking?: boolean;
}

export function NaiTutorDrawer({ conceptSlug, stepId, stepTitle }: NaiTutorDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
          stream: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menghubungi server tutor");
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
                          text: (m.text ? m.text + "\n\n" : "") + (chunk.content || "Terjadi kesalahan."),
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
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === naiMsgId
            ? {
                ...m,
                text: "Koneksi ke Nai terputus sementara. Kamu tetap bisa membuka petunjuk bergradasi 4-layer di atas!",
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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-accent text-surface-raised font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all border border-accent-subtle"
      >
        <Bot className="w-5 h-5" />
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
                <span className="w-9 h-9 rounded-2xl bg-accent/15 flex items-center justify-center text-accent shadow-xs">
                  <Bot className="w-5 h-5" />
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

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-accent text-surface-raised rounded-br-2xs"
                        : "bg-surface border border-border text-text rounded-bl-2xs shadow-2xs w-full sm:w-auto min-w-[220px]"
                    }`}
                  >
                    {/* Collapsible Think / Reasoning Box for Nai */}
                    {msg.sender === "nai" && Boolean(msg.thought || msg.isThinking) && (
                      <div className="w-full mb-3 rounded-xl border border-border/80 bg-surface-raised/90 overflow-hidden shadow-2xs">
                        {/* Toggle button: hide / unhide with expand */}
                        <button
                          type="button"
                          onClick={() => toggleThought(msg.id)}
                          className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-surface transition-colors gap-2 cursor-pointer select-none"
                          aria-expanded={expandedThoughts[msg.id] ?? Boolean(msg.isThinking)}
                          aria-label={
                            (expandedThoughts[msg.id] ?? Boolean(msg.isThinking))
                              ? "Sembunyikan proses berpikir Nai"
                              : "Buka proses berpikir Nai"
                          }
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Brain
                              className={`w-3.5 h-3.5 shrink-0 text-accent ${
                                msg.isThinking ? "animate-pulse" : ""
                              }`}
                            />
                            <span className="text-[11px] font-semibold text-text-muted truncate">
                              {msg.isThinking ? "Nai sedang menalar..." : "Proses Berpikir (Reasoning)"}
                            </span>
                            {msg.isThinking && (
                              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-text-muted font-medium">
                            <span className="hidden sm:inline">
                              {(expandedThoughts[msg.id] ?? Boolean(msg.isThinking))
                                ? "Sembunyikan"
                                : "Buka"}
                            </span>
                            {(expandedThoughts[msg.id] ?? Boolean(msg.isThinking)) ? (
                              <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                            )}
                          </div>
                        </button>

                        {/* Collapsible Content */}
                        {(expandedThoughts[msg.id] ?? Boolean(msg.isThinking)) && (
                          <div className="px-3.5 py-2.5 border-t border-border/60 text-[11px] text-text-muted leading-relaxed font-mono bg-surface/50 border-l-2 border-l-accent/60 space-y-1">
                            {msg.thought ? (
                              <MathRenderer content={msg.thought} />
                            ) : (
                              <span className="italic text-[11px] text-text-muted/70">
                                Mengidentifikasi konsep dan merumuskan scaffolding pemantik...
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Answer text & streaming cursor */}
                    {msg.text ? (
                      <div className="text-xs leading-relaxed">
                        <MathRenderer content={msg.text} />
                        {msg.isStreaming && !msg.isThinking && (
                          <span className="inline-block w-1.5 h-3.5 ml-1 bg-accent animate-pulse align-middle rounded-xs" />
                        )}
                      </div>
                    ) : (
                      msg.sender === "nai" && !msg.isThinking && (
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <Bot className="w-3.5 h-3.5 text-accent animate-pulse" />
                          <span>Menyiapkan petunjuk pemantik...</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.sender === "user" && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface border border-border text-xs text-text-muted max-w-[75%] shadow-2xs">
                  <Bot className="w-4 h-4 text-accent animate-pulse" />
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
