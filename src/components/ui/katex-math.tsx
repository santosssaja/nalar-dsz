"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className = "" }: MathRendererProps) {
  const renderedHtml = useMemo(() => {
    if (!content) return "";

    // Replace block math $$ ... $$
    let parsed = content.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
      try {
        return `<div class="my-4 overflow-x-auto text-center">${katex.renderToString(
          tex.trim(),
          { displayMode: true, throwOnError: false }
        )}</div>`;
      } catch {
        return `<div class="my-4 text-danger font-mono text-xs">[Formula Error]</div>`;
      }
    });

    // Replace inline math $ ... $
    parsed = parsed.replace(/\$([^\$\n]+?)\$/g, (_, tex) => {
      try {
        return katex.renderToString(tex.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return `<span class="text-danger font-mono text-xs">[Math]</span>`;
      }
    });

    // Format newlines as line breaks
    parsed = parsed.replace(/\n\n/g, "<br/><br/>");

    return parsed;
  }, [content]);

  return (
    <div
      className={`leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
