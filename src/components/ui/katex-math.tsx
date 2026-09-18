"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
  content: string;
  className?: string;
  as?: "div" | "span";
  inline?: boolean;
}

export function MathRenderer({
  content,
  className = "",
  as = "div",
  inline = false,
}: MathRendererProps) {
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

  const Component = inline ? "span" : as;

  return (
    <Component
      className={inline ? className : `leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
