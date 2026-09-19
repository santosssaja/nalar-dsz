import { describe, it, expect } from "vitest";
import { splitThinkAndText, transformThinkTags } from "@/server/ai/stream-utils";

describe("Stream Utils (<think> Tag Transformation & Parsing)", () => {
  it("splits static text with complete <think>...</think> tags", () => {
    const raw = "<think>Menganalisis rumus turunan f'(x)</think>Halo! Apa yang terjadi saat limit mendekati nol?";
    const result = splitThinkAndText(raw);

    expect(result.thought).toBe("Menganalisis rumus turunan f'(x)");
    expect(result.text).toBe("Halo! Apa yang terjadi saat limit mendekati nol?");
  });

  it("handles static text without <think> tags", () => {
    const raw = "Penjelasan langsung tanpa proses berpikir eksplisit.";
    const result = splitThinkAndText(raw);

    expect(result.thought).toBeUndefined();
    expect(result.text).toBe(raw);
  });

  it("handles unclosed <think> tag gracefully", () => {
    const raw = "<think>Proses berpikir yang terputus di tengah jalan";
    const result = splitThinkAndText(raw);

    expect(result.thought).toBe("Proses berpikir yang terputus di tengah jalan");
    expect(result.text).toBe("");
  });

  it("streams and isolates thought vs text chunks in real-time", async () => {
    async function* generateChunks() {
      yield "<think>";
      yield "Langkah 1: Cek prasyarat. ";
      yield "Langkah 2: Susun scaffolding.";
      yield "</think>";
      yield "Halo murid, ";
      yield "coba perhatikan kurva berikut.";
    }

    const items: Array<{ type: "thought" | "text"; content: string }> = [];
    for await (const item of transformThinkTags(generateChunks())) {
      items.push(item);
    }

    const thoughts = items.filter((i) => i.type === "thought").map((i) => i.content).join("");
    const texts = items.filter((i) => i.type === "text").map((i) => i.content).join("");

    expect(thoughts).toContain("Langkah 1: Cek prasyarat");
    expect(thoughts).toContain("Langkah 2: Susun scaffolding.");
    expect(texts).toBe("Halo murid, coba perhatikan kurva berikut.");
  });

  it("handles tags split across chunk boundaries (e.g. '<thi' and 'nk>')", async () => {
    async function* generateSplitChunks() {
      yield "Awal teks. <thi";
      yield "nk>Alur pemikiran rahasia.</th";
      yield "ink> Akhir teks.";
    }

    const items: Array<{ type: "thought" | "text"; content: string }> = [];
    for await (const item of transformThinkTags(generateSplitChunks())) {
      items.push(item);
    }

    const thoughts = items.filter((i) => i.type === "thought").map((i) => i.content).join("");
    const texts = items.filter((i) => i.type === "text").map((i) => i.content).join("");

    expect(thoughts).toBe("Alur pemikiran rahasia.");
    expect(texts).toBe("Awal teks.  Akhir teks.");
  });
});
