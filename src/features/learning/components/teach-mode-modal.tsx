"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { GraduationCap, X, Bot, CheckCircle, AlertCircle } from "lucide-react";
import { ConceptContent } from "@/content/schema";
import { MathRenderer } from "@/components/ui/katex-math";
import { AiTeachEvaluation } from "@/server/ai/types";

interface TeachModeModalProps {
  concept: ConceptContent;
  isOpen: boolean;
  onClose: () => void;
}

export function TeachModeModal({ concept, isOpen, onClose }: TeachModeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [teachingText, setTeachingText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      default:
        return `Guru, Nai ingin paham tentang konsep '${concept.title}'. Bisa tolong jelaskan intuisinya dengan analogi sederhana?`;
    }
  }, [concept]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teachingText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/ai/teach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptSlug: concept.slug,
          naiQuestion,
          userTeachingExplanation: teachingText,
          provider: "gemma",
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setEvaluation(json.data.evaluation);
      }
    } catch {
      // Fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setEvaluation(null);
    setTeachingText("");
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-surface-raised border border-border rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <GraduationCap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-text">Mode Guru (Teach Nai)</h2>
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

        {!evaluation ? (
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
                className="px-6 py-2.5 rounded-lg text-xs font-bold bg-accent text-surface-raised hover:bg-accent-hover transition-colors disabled:opacity-40 shadow-xs"
              >
                {isSubmitting ? "Nai Sedang Menyimak..." : "Kirim Pelajaran ke Nai →"}
              </button>
            </div>
          </form>
        ) : (
          /* Evaluation & Nai's Response */
          <div className="space-y-4 animate-in fade-in">
            <div
              className={`p-5 rounded-xl border space-y-3 ${
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

              <div className="text-xs text-text leading-relaxed bg-surface/80 p-3.5 rounded-lg border border-border-subtle">
                <div className="font-semibold text-accent mb-1 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  <span>Tanggapan Murid Nai:</span>
                </div>
                <MathRenderer content={evaluation.naiResponse} />
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

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-medium border border-border rounded-lg text-text hover:bg-surface"
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
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
