"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Bot, X, Lightbulb, HelpCircle, BookOpen, Send } from "lucide-react";
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
                        : "bg-surface border border-border text-text rounded-bl-2xs shadow-2xs"
                    }`}
                  >
                    <MathRenderer content={msg.text} />
                  </div>
                </div>
              ))}

              {isLoading && (
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
