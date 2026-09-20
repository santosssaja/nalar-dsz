"use client";

import React from "react";
import Image from "next/image";
import { Brain, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { MathRenderer } from "@/components/ui/katex-math";

export interface ChatMessage {
  id: string;
  sender: "user" | "nai";
  text: string;
  thought?: string;
  notice?: string;
  error?: string;
  isStreaming?: boolean;
  isThinking?: boolean;
}

interface NaiChatMessageProps {
  message: ChatMessage;
  isThoughtExpanded: boolean;
  onToggleThought: (messageId: string) => void;
}

export function NaiChatMessageItem({
  message: msg,
  isThoughtExpanded,
  onToggleThought,
}: NaiChatMessageProps) {
  const isUser = msg.sender === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
          isUser
            ? "bg-accent text-surface-raised rounded-br-2xs"
            : "bg-surface border border-border text-text rounded-bl-2xs shadow-2xs w-full sm:w-auto min-w-[220px]"
        }`}
      >
        {/* Collapsible Think / Reasoning Box for Nai */}
        {!isUser && Boolean(msg.thought || msg.isThinking) && (
          <div className="w-full mb-3 rounded-xl border border-border/80 bg-surface-raised/90 overflow-hidden shadow-2xs">
            {/* Toggle button: hide / unhide with expand */}
            <button
              type="button"
              onClick={() => onToggleThought(msg.id)}
              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-surface transition-colors gap-2 cursor-pointer select-none"
              aria-expanded={isThoughtExpanded}
              aria-label={
                isThoughtExpanded
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
                  {isThoughtExpanded ? "Sembunyikan" : "Buka"}
                </span>
                {isThoughtExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                )}
              </div>
            </button>

            {/* Collapsible Content */}
            {isThoughtExpanded && (
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

        {/* Notice Banner (e.g. Rate limit fallback notice) */}
        {msg.notice && (
          <div className="mb-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-2xs flex items-start gap-2 leading-relaxed animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>{msg.notice}</span>
          </div>
        )}

        {/* Error Banner */}
        {msg.error && (
          <div className="mb-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-2xs flex items-start gap-2 leading-relaxed animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{msg.error}</span>
          </div>
        )}

        {/* Answer text & streaming cursor */}
        {msg.text && !msg.error ? (
          <div className="text-xs leading-relaxed">
            <MathRenderer content={msg.text} />
            {msg.isStreaming && !msg.isThinking && (
              <span className="inline-block w-1.5 h-3.5 ml-1 bg-accent animate-pulse align-middle rounded-xs" />
            )}
          </div>
        ) : (
          !isUser && !msg.isThinking && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Image
                src="/figma-assets/logo-nalar.webp"
                alt=""
                width={16}
                height={16}
                className="w-3.5 h-3.5 object-contain animate-pulse shrink-0"
              />
              <span>Menyiapkan petunjuk pemantik...</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
