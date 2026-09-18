"use client";

import React, { useMemo } from "react";
import katex from "katex";
import { Marked, type Tokens } from "marked";

interface MathRendererProps {
  content: string;
  className?: string;
  as?: "div" | "span" | "p";
  inline?: boolean;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const markedInstance = new Marked({
  gfm: true,
  breaks: false,
});

markedInstance.use({
  renderer: {
    heading({ tokens, depth }: Tokens.Heading): string {
      const text = this.parser.parseInline(tokens);
      const headingClass =
        depth === 1
          ? "text-xl font-bold text-text mt-4 mb-2"
          : depth === 2
          ? "text-lg font-bold text-text mt-3.5 mb-1.5"
          : depth === 3
          ? "text-base font-bold text-text mt-3 mb-1"
          : "text-sm font-bold text-text mt-2.5 mb-1";
      return `<h${depth} class="${headingClass}">${text}</h${depth}>`;
    },
    paragraph({ tokens }: Tokens.Paragraph): string {
      const text = this.parser.parseInline(tokens);
      return `<p class="my-2 leading-relaxed">${text}</p>`;
    },
    list(token: Tokens.List): string {
      const tag = token.ordered ? "ol" : "ul";
      const cls = token.ordered
        ? "list-decimal pl-5 my-2 space-y-1"
        : "list-disc pl-5 my-2 space-y-1";
      const body = token.items.map((item) => this.listitem(item)).join("");
      return `<${tag} class="${cls}">${body}</${tag}>`;
    },
    listitem(item: Tokens.ListItem): string {
      const text = this.parser.parse(item.tokens);
      return `<li>${text}</li>`;
    },
    blockquote({ tokens }: Tokens.Blockquote): string {
      const text = this.parser.parse(tokens);
      return `<blockquote class="border-l-4 border-accent/60 pl-3.5 my-2.5 text-text-muted italic space-y-1">${text}</blockquote>`;
    },
    code({ text, lang }: Tokens.Code): string {
      const escaped = escapeHtml(text);
      return `<pre class="p-3 my-3 rounded-xl bg-surface border border-border font-mono text-xs overflow-x-auto text-text"><code class="language-${lang || "text"}">${escaped}</code></pre>`;
    },
    codespan({ text }: Tokens.Codespan): string {
      const escaped = escapeHtml(text);
      return `<code class="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-xs text-accent">${escaped}</code>`;
    },
    link({ href, title, tokens }: Tokens.Link): string {
      const text = this.parser.parseInline(tokens);
      const titleAttr = title ? ` title="${title}"` : "";
      return `<a href="${href}"${titleAttr} class="text-accent underline hover:text-accent-hover" target="_blank" rel="noopener noreferrer">${text}</a>`;
    },
    hr(): string {
      return '<hr class="my-4 border-border" />';
    },
    table(token: Tokens.Table): string {
      let headerHtml = "";
      for (const cell of token.header) {
        headerHtml += this.tablecell(cell);
      }
      let bodyHtml = "";
      for (const row of token.rows) {
        let rowHtml = "";
        for (const cell of row) {
          rowHtml += this.tablecell(cell);
        }
        rowHtml = this.tablerow({ text: rowHtml });
        bodyHtml += rowHtml;
      }
      return `<div class="overflow-x-auto my-3"><table class="w-full border-collapse text-xs border border-border"><thead><tr class="bg-surface">${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
    },
    tablecell(token: Tokens.TableCell): string {
      const text = this.parser.parseInline(token.tokens);
      const alignAttr = token.align ? ` style="text-align:${token.align}"` : "";
      if (token.header) {
        return `<th class="border border-border p-2 font-semibold text-text text-left"${alignAttr}>${text}</th>`;
      }
      return `<td class="border border-border p-2 text-text"${alignAttr}>${text}</td>`;
    },
  },
  extensions: [
    {
      name: "blockMath",
      level: "block",
      start(src: string) {
        return src.indexOf("$$");
      },
      tokenizer(src: string) {
        const match = src.match(/^\$\$([\s\S]+?)\$\$/);
        if (match) {
          return {
            type: "blockMath",
            raw: match[0],
            text: match[1].trim(),
          };
        }
      },
      renderer(token: Tokens.Generic) {
        try {
          const rendered = katex.renderToString(token.text as string, {
            displayMode: true,
            throwOnError: false,
          });
          return `<div class="my-4 overflow-x-auto text-center">${rendered}</div>`;
        } catch {
          return `<div class="my-4 text-danger font-mono text-xs text-center">[Formula Error]</div>`;
        }
      },
    },
    {
      name: "displayMath",
      level: "inline",
      start(src: string) {
        return src.indexOf("$$");
      },
      tokenizer(src: string) {
        const match = src.match(/^\$\$([\s\S]+?)\$\$/);
        if (match) {
          return {
            type: "displayMath",
            raw: match[0],
            text: match[1].trim(),
          };
        }
      },
      renderer(token: Tokens.Generic) {
        try {
          const rendered = katex.renderToString(token.text as string, {
            displayMode: true,
            throwOnError: false,
          });
          return `<div class="my-4 overflow-x-auto text-center">${rendered}</div>`;
        } catch {
          return `<div class="my-4 text-danger font-mono text-xs text-center">[Formula Error]</div>`;
        }
      },
    },
    {
      name: "inlineMath",
      level: "inline",
      start(src: string) {
        return src.indexOf("$");
      },
      tokenizer(src: string) {
        const match = src.match(/^\$([^$\n]+?)\$/);
        if (match) {
          return {
            type: "inlineMath",
            raw: match[0],
            text: match[1].trim(),
          };
        }
      },
      renderer(token: Tokens.Generic) {
        try {
          const rendered = katex.renderToString(token.text as string, {
            displayMode: false,
            throwOnError: false,
          });
          return `<span class="inline-block">${rendered}</span>`;
        } catch {
          return `<span class="text-danger font-mono text-xs">[Math Error]</span>`;
        }
      },
    },
  ],
});

export function parseMarkdownAndMath(content: string, inline = false): string {
  if (!content) return "";
  try {
    if (inline) {
      return markedInstance.parseInline(content, { async: false }) as string;
    }
    return markedInstance.parse(content, { async: false }) as string;
  } catch (err) {
    console.error("Markdown parsing error:", err);
    return escapeHtml(content);
  }
}

export function MathRenderer({
  content,
  className = "",
  as = "div",
  inline = false,
}: MathRendererProps) {
  const renderedHtml = useMemo(() => {
    return parseMarkdownAndMath(content, inline);
  }, [content, inline]);

  const Component = inline ? "span" : as;

  return (
    <Component
      className={inline ? className : `leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
