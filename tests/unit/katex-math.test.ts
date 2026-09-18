import { describe, it, expect } from "vitest";
import { parseMarkdownAndMath } from "@/components/ui/katex-math";

describe("parseMarkdownAndMath with marked and KaTeX", () => {
  it("correctly parses nested bold and italic without breaking asterisks", () => {
    const input =
      "Pada kedua contoh di atas, angka nol bukan berarti 'hampa' atau 'tidak ada apa-apa'. Angka nol adalah **titik acuan (*origin*)**. Ketika kita melangkah ke arah yang berlawanan dengan arah positif, kita membutuhkan **bilangan negatif** untuk mencatat posisi secara akurat!";

    const html = parseMarkdownAndMath(input);

    // Must contain <strong>titik acuan (<em>origin</em>)</strong>
    expect(html).toContain("<strong>titik acuan (<em>origin</em>)</strong>");
    // Must contain <strong>bilangan negatif</strong>
    expect(html).toContain("<strong>bilangan negatif</strong>");
    // Must NOT contain leftover raw double asterisks
    expect(html).not.toContain("**");
  });

  it("renders inline KaTeX math correctly", () => {
    const input = "Suhu turun hingga $-15^\\circ\\text{C}$ di puncak gunung.";
    const html = parseMarkdownAndMath(input);

    expect(html).toContain("katex");
    expect(html).not.toContain("$-15^\\circ\\text{C}$");
  });

  it("renders display / block KaTeX math correctly", () => {
    const input = "Rumus limit:\n\n$$\\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}$$\n\nSelesai.";
    const html = parseMarkdownAndMath(input);

    expect(html).toContain("katex");
    expect(html).toContain("katex-display");
  });

  it("renders ordered and unordered lists with appropriate classes", () => {
    const input = "1. Poin Pertama\n2. Poin Kedua\n\n- Opsi A\n- Opsi B";
    const html = parseMarkdownAndMath(input);

    expect(html).toContain("<ol");
    expect(html).toContain("<ul");
    expect(html).toContain("<li");
    expect(html).toContain("Poin Pertama");
    expect(html).toContain("Opsi A");
  });

  it("handles inline=true mode cleanly without outer block paragraph", () => {
    const input = "Hanya teks **tebal** dan $x^2$.";
    const html = parseMarkdownAndMath(input, true);

    expect(html).toContain("<strong>tebal</strong>");
    expect(html).toContain("katex");
    expect(html).not.toMatch(/^<p>/);
  });
});
