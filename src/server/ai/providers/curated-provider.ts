import {
  IAiProvider,
  AiMessage,
  AiChatOptions,
  AiChatResponse,
  AiSocraticContext,
  AiTeachContext,
  AiTeachEvaluation,
  AiChatChunk,
  AiTeachChunk,
} from "../types";

export class CuratedLocalProvider implements IAiProvider {
  public readonly name = "curated" as const;

  async chat(messages: AiMessage[], _options?: AiChatOptions): Promise<AiChatResponse> {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const lower = lastUserMsg.toLowerCase();

    let reply = "Halo! Nai di sini siap memandumu menjelajahi materi ini secara bertahap. Apa bagian yang ingin kamu diskusikan?";
    if (lower.includes("rumus") || lower.includes("cara hitung")) {
      reply = "Untuk menghitung langkah ini, coba amati variabel apa saja yang sudah diketahui dari soal dan apa yang ditanyakan. Apakah ada hubungan antara keduanya di grafik atau rumus dasarnya?";
    } else if (lower.includes("salah") || lower.includes("bingung")) {
      reply = "Jangan khawatir, merasa bingung adalah tanda awal otakmu sedang membangun pemahaman baru! Coba perhatikan kembali petunjuk arah dan titik acuan yang diberikan.";
    }

    return {
      text: reply,
      provider: "curated",
      model: "curated-socratic-engine",
    };
  }

  async socraticGuidance(
    context: AiSocraticContext,
    _options?: AiChatOptions
  ): Promise<AiChatResponse> {
    const questionLower = context.userQuestion.toLowerCase();

    // Check if user question relates to common misconceptions
    let targetedHint = "";
    if (context.misconceptions && context.misconceptions.length > 0) {
      for (const misc of context.misconceptions) {
        const keywords = misc.label.toLowerCase().split(/\s+/).filter((k) => k.length > 4);
        if (keywords.some((k) => questionLower.includes(k))) {
          targetedHint = `**Pijakan Berpikir dari Nai:** ${misc.remediation}`;
          break;
        }
      }
    }

    if (!targetedHint) {
      if (questionLower.includes("jawaban") || questionLower.includes("apa hasilnya")) {
        targetedHint =
          "Nai tidak bisa langsung membocorkan jawaban akhirnya ya! Tapi coba renungkan: apa yang terjadi pada nilai besaran ini jika kamu mengubah parameter langkah demi langkah?";
      } else if (questionLower.includes("kenapa") || questionLower.includes("mengapa")) {
        targetedHint =
          "Pertanyaan yang bagus sekali! Coba hubungkan dengan konsep dasar yang baru saja kita pelajari pada bagian penjelasan di atas. Apakah ada pola yang berulang di sana?";
      } else {
        targetedHint = `Coba perhatikan kembali instruksi pada langkah **${context.stepTitle}**. Titik mana yang menjadi acuan awal perhitunganmu?`;
      }
    }

    const fullText = `Hai! Nai senang kamu bertanya.\n\n${targetedHint}\n\nCoba selesaikan langkah berikutnya dengan intuisi tersebut!`;

    return {
      text: fullText,
      provider: "curated",
      model: "curated-socratic-engine",
    };
  }

  async *socraticGuidanceStream(
    context: AiSocraticContext,
    options?: AiChatOptions
  ): AsyncIterable<AiChatChunk> {
    const stepInfo = context.stepTitle ? `langkah "${context.stepTitle}"` : "langkah ini";
    const conceptInfo = context.conceptTitle || "konsep ini";

    const thoughts = [
      `Menganalisis pertanyaan siswa pada ${stepInfo} (${conceptInfo}).\n`,
      `Mendeteksi intisari pertanyaan: "${context.userQuestion}".\n`,
      `Memeriksa kemungkinan miskonsepsi kognitif atau permintaan solusi langsung.\n`,
      `Merumuskan scaffolding Sokrates: arahkan pemikiran siswa ke hubungan variabel dasar tanpa membocorkan jawaban akhir.\n`,
    ];

    for (const thoughtChunk of thoughts) {
      yield { type: "thought", content: thoughtChunk };
      await new Promise((r) => setTimeout(r, 35));
    }

    const guidance = await this.socraticGuidance(context, options);
    const words = guidance.text.split(/(\s+)/);
    for (const w of words) {
      if (w) {
        yield { type: "text", content: w };
        await new Promise((r) => setTimeout(r, 15));
      }
    }

    yield {
      type: "done",
      provider: "curated",
      model: "curated-socratic-engine",
    };
  }

  async evaluateTeachMode(
    context: AiTeachContext,
    _options?: AiChatOptions
  ): Promise<AiTeachEvaluation> {
    const explanation = context.userTeachingExplanation.trim();
    const wordCount = explanation.split(/\s+/).length;

    // Check presence of key concept terms
    const lower = explanation.toLowerCase();
    const hasCoreTerms =
      lower.includes("karena") ||
      lower.includes("artinya") ||
      lower.includes("sehingga") ||
      lower.includes("contoh");

    if (wordCount < 10) {
      return {
        understood: false,
        score: 40,
        naiResponse:
          "Hmm, Nai masih agak bingung nih... Penjelasannya masih terlalu singkat. Bisa tolong jelaskan dengan contoh nyata atau alasan logisnya?",
        feedbackForTeacher:
          "Penjelasanmu masih terlalu pendek untuk membangun pemahaman murid. Coba tambahkan alasan mengapa aturan itu berlaku atau gunakan analogi sederhana.",
        suggestions: [
          "Gunakan kata penghubung seperti 'karena' atau 'artinya'",
          "Berikan contoh konkret dalam kehidupan sehari-hari",
        ],
      };
    }

    if (wordCount >= 10 && hasCoreTerms) {
      return {
        understood: true,
        score: 85,
        naiResponse:
          "Wah, sekarang Nai jadi paham banget! Terima kasih ya sudah menjelaskan dengan begitu runtut. Penjelasanmu membuat intuisinya jadi masuk akal di kepala Nai!",
        feedbackForTeacher:
          "Luar biasa! Kamu berhasil menyusun penalaran sebab-akibat yang jelas dan meyakinkan. Mengajarkan konsep kepada orang lain adalah bukti penguasaan materi yang tinggi.",
        suggestions: [
          "Kamu bisa memperkaya lagi dengan menghubungkan ke konsep sebelum atau sesudahnya.",
        ],
      };
    }

    return {
      understood: true,
      score: 70,
      naiResponse:
        "Ooh begitu ya! Nai mulai menangkap gambarannya, tapi ada bagian yang membuat Nai penasaran: bagaimana jika situasinya kita balik?",
      feedbackForTeacher:
        "Penjelasanmu sudah cukup baik dan mencakup ide dasar. Sedikit polesan pada analogi akan membuatnya sempurna.",
      suggestions: ["Perjelas istilah teknis yang kamu gunakan"],
    };
  }

  async *evaluateTeachModeStream(
    context: AiTeachContext,
    options?: AiChatOptions
  ): AsyncIterable<AiTeachChunk> {
    yield {
      type: "thought",
      content: "Nai sedang menyimak penjelasan Guru dengan teliti...",
    };

    const evaluation = await this.evaluateTeachMode(context, options);
    const words = evaluation.naiResponse.split(/(\s+)/);
    for (const w of words) {
      if (w) {
        yield { type: "nai_response", content: w };
        await new Promise((r) => setTimeout(r, 15));
      }
    }

    yield {
      type: "evaluation",
      evaluation,
    };

    yield {
      type: "done",
      provider: "curated",
      model: "curated-teach-engine",
    };
  }
}
