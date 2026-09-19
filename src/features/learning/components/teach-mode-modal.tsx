"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { GraduationCap, X, Bot, CheckCircle, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { ConceptContent } from "@/content/schema";
import { MathRenderer } from "@/components/ui/katex-math";
import { AiTeachEvaluation, AiTeachChunk } from "@/server/ai/types";

interface TeachModeModalProps {
  concept: ConceptContent;
  isOpen: boolean;
  onClose: () => void;
}

export function TeachModeModal({ concept, isOpen, onClose }: TeachModeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [teachingText, setTeachingText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [thoughtText, setThoughtText] = useState("");
  const [streamingNaiResponse, setStreamingNaiResponse] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<AiTeachEvaluation | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Generate starter question from Nai according to the concept
  const naiQuestion = React.useMemo(() => {
    switch (concept.slug) {
      case "perubahan":
        return "Guru, Nai masih bingung... apa bedanya jam tangan digital yang melompat per detik dengan tetesan air hujan yang mengalir di bukit?";
      case "laju-perubahan":
        return "Guru, kenapa spidometer di mobil bisa menunjuk angka 70 km/jam saat itu juga, padahal kita belum selesai jalan 1 jam penuh?";
      case "definisi-turunan":
        return "Guru, kenapa kita butuh limit saat jarak h mendekati nol? Kenapa kita tidak langsung masukkan saja h = 0 ke dalam rumusnya?";
      case "bilangan":
        return "Guru, teman Nai bilang angka minus sepuluh harusnya lebih besar dari minus dua karena sepuluh lebih besar dari dua. Kenapa salah ya?";
      case "operasi-aritmetika":
        return "Guru, kenapa waktu kita menghapus utang, uang kita malah terasa bertambah? Kenapa mengurang negatif sama dengan menambah?";
      case "pecahan-dan-desimal":
        return "Guru, angka 8 kan dua kali lebih besar dari 4, kenapa sepotong kue seperdelapan justru lebih kecil daripada seperempat?";
      case "pengukuran-dan-besaran":
        return "Guru, kenapa seorang ilmuwan tidak boleh hanya menulis 'panjangnya 5', tapi wajib menuliskan satuannya seperti meter?";
      case "vektor":
        return "Guru, kalau dua orang menarik tali masing-masing dengan gaya 5 Newton, kenapa tali itu bisa terasa ditarik 0 Newton atau 10 Newton?";
      case "kinematika":
        return "Guru, kalau mobil melaju dengan kecepatan tetap 50 km/jam tapi sedang belok di tikungan, kenapa mobil itu dibilang mengalami percepatan?";
      case "materi-dan-sifatnya":
        return "Guru, waktu sepotong kayu terbakar habis menjadi segenggam abu, ke mana perginya sisa massa kayu yang hilang itu?";
      case "unsur-dan-senyawa":
        return "Guru, gas hidrogen mudah meledak dan gas oksigen pemicu api, tapi kenapa air H2O gabungan keduanya malah memadamkan api?";
      case "atom":
        return "Guru, kalau atom tubuh kita dan atom meja kayu hampir semuanya ruang hampa kosong, kenapa tangan kita tidak tembus waktu memukul meja?";
      case "karakteristik-kehidupan":
        return "Guru, robot pintar bisa berjalan dan bicara, tapi kenapa robot dibilang benda mati sedangkan bakteri got dibilang makhluk hidup?";
      case "tingkatan-organisasi-kehidupan":
        return "Guru, apa maksudnya sifat emergen? Kenapa sekelompok sel bisa membentuk otak yang bisa berpikir padahal sel satuan tidak punya pikiran?";
      case "rasio-dan-proporsi":
        return "Guru, kenapa campuran 2 gelas sirup banding 3 gelas air rasanya tetap sama manisnya kalau kita bikin 4 gelas sirup banding 6 gelas air?";
      case "persentase":
        return "Guru, kenapa diskon 50% lalu ada diskon tambahan 20% tidak sama dengan diskon 70%?";
      case "pangkat-dan-akar":
        return "Guru, kenapa angka berapa pun dipangkatkan nol hasilnya satu dan bukan nol?";
      case "urutan-dan-pola":
        return "Guru, bagaimana cara kita tahu angka ke-100 dari suatu barisan tanpa harus menghitungnya satu demi satu?";
      case "estimasi":
        return "Guru, kenapa memperkirakan jawaban dulu sebelum menghitung teliti justru tanda orang yang paham matematika?";
      case "satuan-dan-pengukuran-matematika":
        return "Guru, kenapa 1 meter persegi sama dengan 10.000 sentimeter persegi dan bukan 100 sentimeter persegi?";
      case "gerak-lurus":
        return "Guru, kenapa waktu kereta cepat melaju konstan 300 km/jam air di gelas tenang, tapi begitu direm mendadak airnya langsung tumpah?";
      case "gerak-parabola":
        return "Guru, kalau ada dua peluru dijatuhkan dari ketinggian sama, satu ditembakkan kencang mendatar dan satu dijatuhkan bebas, kenapa mereka menyentuh tanah bersamaan?";
      case "gerak-melingkar":
        return "Guru, kalau kelajuan mobil di tikungan tetap 40 km/jam, kenapa mobil itu dibilang memiliki percepatan sentripetal?";
      case "hukum-newton":
        return "Guru, kalau gaya aksi dan reaksi besarnya sama tapi berlawanan arah, kenapa kuda bisa menarik kereta maju dan tidak saling menghilangkan?";
      case "gaya":
        return "Guru, kenapa meja kayu bisa menahan buku yang ditarik gravitasi tanpa runtuh? Meja itu mendorong balik pakai apa?";
      case "gesekan":
        return "Guru, kenapa mendorong lemari pakaian yang diam berat sekali di awal, tapi begitu meluncur terasa lebih enteng?";
      case "usaha-dan-energi":
        return "Guru, kalau Nai memikul kardus berat sambil jalan datar sejauh 100 meter, kenapa fisika bilang usaha gravitasi Nai adalah nol?";
      case "momentum-dan-impuls":
        return "Guru, kenapa jatuh ke atas kasur busa tebal tidak sakit, tapi jatuh ke lantai semen keras bisa mematahkan tulang?";
      case "tumbukan":
        return "Guru, pada mainan bandul Newton, kenapa kalau kita tarik satu bola hanya satu bola di ujung lain yang terpental?";
      case "rotasi":
        return "Guru, pada balapan menggelinding di bidang miring, kenapa bola pejal selalu mengalahkan pipa berongga bermassa sama?";
      case "torsi":
        return "Guru, kenapa gagang pintu selalu dipasang di ujung paling jauh dari engsel dan tidak pernah di dekat engsel?";
      case "momentum-sudut":
        return "Guru, kenapa penari balet bisa berputar makin kencang waktu melipat tangannya ke dada padahal tidak ada dorongan baru?";
      case "gravitasi":
        return "Guru, kenapa astronot di stasiun luar angkasa ISS melayang? Apakah benar di sana sudah tidak ada gravitasi bumi?";
      case "kesetimbangan":
        return "Guru, kenapa mobil balap Formula 1 dibuat sangat ceper dan lebar rodanya? Apa hubungannya dengan titik berat?";
      case "osilasi":
        return "Guru, kenapa ayunan bandul jam dinding waktunya tetap sama persis meskipun ayunannya sudah melemah dan menyempit?";
      case "molekul":
        return "Guru, kenapa gas hidrogen yang mudah meledak dan gas oksigen pemicu api bisa berubah jadi molekul air yang memadamkan api?";
      case "ion":
        return "Guru, kenapa kristal garam padat tidak bisa menghantarkan listrik, tapi kalau dilarutkan ke air lampunya langsung menyala?";
      case "sistem-periodik":
        return "Guru, kenapa ukuran atom Klorin lebih kecil dari atom Natrium padahal Klorin punya lebih banyak proton dan elektron?";
      case "konfigurasi-elektron":
        return "Guru, kenapa elektron lebih suka mengisi kamar orbital kosong sendirian dulu sebelum berpasangan?";
      case "bilangan-kuantum":
        return "Guru, kenapa tidak boleh ada dua elektron dalam satu atom yang punya empat bilangan kuantum sama?";
      case "ikatan-kimia":
        return "Guru, kenapa logam seperti emas bisa ditempa jadi lembaran tipis tanpa pecah sedangkan kaca langsung hancur berkeping-keping?";
      case "struktur-lewis":
        return "Guru, kenapa molekul air H2O bentuknya bengkok seperti huruf V dan tidak lurus saja?";
      case "geometri-molekul":
        return "Guru, kenapa gas karbon dioksida CO2 tidak punya kutub listrik tapi molekul air H2O sangat berkutub polar?";
      case "metode-ilmiah":
        return "Guru, kenapa dokter harus menguji obat baru dengan cara buta ganda (double-blind) di mana dokter dan pasien sama-sama tidak tahu?";
      case "sel":
        return "Guru, kenapa sel tubuh makhluk hidup ukurannya mikroskopis dan tidak pernah ada sel tunggal yang sebesar bola basket?";
      case "molekul-biologis":
        return "Guru, kenapa merebus putih telur membuatnya menggumpal keras dan tidak bisa kembali cair lagi?";
      case "energi-dalam-sistem-biologis":
        return "Guru, kenapa tubuh kita repot-repot mendaur ulang molekul ATP ribuan kali sehari padahal kita sudah punya cadangan lemak?";
      default:
        return `Guru, Nai ingin paham tentang konsep '${concept.title}'. Bisa tolong jelaskan intuisinya dengan analogi sederhana?`;
    }
  }, [concept]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teachingText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setIsStreaming(true);
    setErrorMessage(null);
    setThoughtText("");
    setStreamingNaiResponse("");
    setEvaluation(null);

    try {
      const res = await fetch("/api/v1/ai/teach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptSlug: concept.slug,
          naiQuestion,
          userTeachingExplanation: teachingText,
          provider: "gemma",
          stream: true,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error?.message ?? "Gagal memproses pengajaran.");
      }

      const reader = res.body?.getReader();
      if (!reader) {
        // Fallback for non-streaming response
        const json = await res.json();
        if (json.data?.evaluation) {
          setEvaluation(json.data.evaluation);
        }
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const payloadStr = trimmed.slice(6).trim();
          if (payloadStr === "[DONE]") continue;

          try {
            const chunk = JSON.parse(payloadStr) as AiTeachChunk;
            if (chunk.type === "thought" && chunk.content) {
              setThoughtText((prev) => prev + chunk.content);
            } else if (chunk.type === "nai_response" && chunk.content) {
              setStreamingNaiResponse((prev) => prev + chunk.content);
            } else if (chunk.type === "evaluation" && chunk.evaluation) {
              setEvaluation(chunk.evaluation);
            } else if (chunk.type === "error" && chunk.content) {
              setErrorMessage(chunk.content);
            }
          } catch {
            // Ignore partial json parse errors
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kendala saat menyimak pengajaran.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
      setIsStreaming(false);
    }
  };

  const handleReset = () => {
    setEvaluation(null);
    setStreamingNaiResponse("");
    setThoughtText("");
    setErrorMessage(null);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="teach-mode-title"
        className="w-full max-w-2xl bg-surface-raised border border-border rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <GraduationCap className="w-5 h-5" />
            </span>
            <div>
              <h2 id="teach-mode-title" className="text-base font-bold text-text">Mode Guru (Teach Nai)</h2>
              <p className="text-xs text-text-muted">
                Jadilah guru bagi Nai untuk membuktikan penguasaan konsepmu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border text-text-muted hover:text-text hover:bg-surface text-xs transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nai's Student Prompt */}
        <div className="p-4 rounded-xl bg-accent-muted/20 border border-accent/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-accent">
            <Bot className="w-4 h-4" />
            <span>Nai bertanya padamu:</span>
          </div>
          <p className="text-sm text-text font-medium leading-relaxed italic">
            &ldquo;{naiQuestion}&rdquo;
          </p>
        </div>

        {/* Dynamic State: Input Form vs Live Streaming / Evaluation View */}
        {!isSubmitting && !isStreaming && !evaluation ? (
          /* Teaching Input Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="teaching-explanation" className="block text-xs font-semibold text-text mb-1.5">
                Ajarkan dan Jelaskan kepada Nai:
              </label>
              <textarea
                id="teaching-explanation"
                rows={5}
                value={teachingText}
                onChange={(e) => setTeachingText(e.target.value)}
                placeholder="Tuliskan penjelasanmu layaknya seorang guru yang sabar. Berikan alasan logis, analogi nyata, atau langkah-langkah berpikirnya..."
                className="w-full p-3 text-xs rounded-xl bg-surface border border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent leading-relaxed"
                disabled={isSubmitting}
              />
              <span className="text-[11px] text-text-muted block mt-1">
                Tips: Penjelasan yang baik menghubungkan sebab-akibat dan memakai contoh nyata.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-text-muted hover:text-text"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!teachingText.trim() || isSubmitting}
                className="px-6 py-2.5 rounded-lg text-xs font-bold bg-accent text-surface-raised hover:bg-accent-hover transition-colors disabled:opacity-40 shadow-xs flex items-center gap-2"
              >
                Kirim Pelajaran ke Nai →
              </button>
            </div>
          </form>
        ) : (
          /* Live Stream & Evaluation View */
          <div className="space-y-4 animate-in fade-in">
            {/* User's Teaching Explanation recap */}
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Pelajaran yang kamu ajarkan:
              </span>
              <p className="text-xs text-text leading-relaxed italic">
                &ldquo;{teachingText}&rdquo;
              </p>
            </div>

            {/* Waiting for first response */}
            {isStreaming && !thoughtText && !streamingNaiResponse && (
              <div className="p-5 rounded-xl bg-surface border border-border text-center space-y-2">
                <Loader2 className="w-5 h-5 animate-spin text-accent mx-auto" />
                <p className="text-xs font-medium text-text">Nai sedang menyimak dan merenungkan penjelasanmu...</p>
              </div>
            )}

            {/* Nai's Student Thought (Streaming Thought) */}
            {thoughtText && (
              <div className="p-3 rounded-lg bg-accent/5 border border-accent/15 text-xs text-accent space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Proses Berpikir Murid Nai:</span>
                </div>
                <p className="text-text-muted italic text-[11px] leading-relaxed">
                  {thoughtText}
                </p>
              </div>
            )}

            {/* Nai's Student Response (Streaming token-by-token or completed) */}
            {(streamingNaiResponse || (evaluation && evaluation.naiResponse)) && (
              <div className="text-xs text-text leading-relaxed bg-surface/80 p-3.5 rounded-lg border border-border-subtle space-y-1.5 animate-in fade-in">
                <div className="font-semibold text-accent flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    <span>Tanggapan Murid Nai:</span>
                  </div>
                  {isStreaming && (
                    <span className="flex items-center gap-1 text-[11px] font-normal text-text-muted">
                      <Loader2 className="w-3 h-3 animate-spin text-accent" />
                      sedang merespons...
                    </span>
                  )}
                </div>
                <div className="text-text leading-relaxed">
                  <MathRenderer content={streamingNaiResponse || evaluation?.naiResponse || ""} />
                  {isStreaming && (
                    <span
                      className="inline-block w-1.5 h-3.5 bg-accent ml-1 animate-pulse align-middle"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-danger-muted/20 border border-danger/30 text-xs text-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Evaluation Scorecard (revealed once evaluation is received) */}
            {evaluation && (
              <div
                className={`p-5 rounded-xl border space-y-3 animate-in fade-in ${
                  evaluation.understood
                    ? "bg-success-muted/20 border-success/40"
                    : "bg-warning-muted/20 border-warning/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {evaluation.understood ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-warning" />
                    )}
                    <span className="font-bold text-sm text-text">
                      {evaluation.understood ? "Nai Berhasil Paham!" : "Nai Butuh Sedikit Bantuan Lagi"}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-surface border border-border text-text">
                    Skor Mengajar: {evaluation.score}/100
                  </span>
                </div>

                <div className="text-xs text-text-muted leading-relaxed">
                  <span className="font-semibold text-text">Catatan untuk Gurumu: </span>
                  {evaluation.feedbackForTeacher}
                </div>

                {evaluation.suggestions.length > 0 && (
                  <div className="text-xs text-text-muted space-y-1">
                    <span className="font-semibold text-text">Poin Pengayaan:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {evaluation.suggestions.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons once streaming finishes */}
            {!isStreaming && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-medium border border-border rounded-lg text-text hover:bg-surface transition-colors"
                >
                  Coba Ajarkan Lagi
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-bold bg-accent text-surface-raised rounded-lg hover:bg-accent-hover transition-colors shadow-xs"
                >
                  Selesai
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
