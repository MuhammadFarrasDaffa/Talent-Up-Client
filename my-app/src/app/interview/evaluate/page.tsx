"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { OverallCard } from "./components/OverallCard";
import { EvaluationCard } from "./components/EvaluationCard";
import { Recommendations } from "./components/Recommendations";
import { StateCard } from "./components/StateCard";
import { InterviewEvaluation } from "@/types";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button"; // Asumsi pakai UI Button kita
import {
  ChevronLeft,
  Download,
  RefreshCw,
  FileText,
  Share2,
  Loader2,
  AlertCircle,
  BarChart3,
} from "lucide-react";

export default function InterviewEvaluationPage() {
  const router = useRouter(); // Tambahkan router untuk navigasi
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (interviewId) {
      evaluateInterview();
    }
  }, [interviewId]);

  const evaluateInterview = async () => {
    if (!interviewId) {
      setError("Interview ID tidak ditemukan");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:3000/interviews/${interviewId}/evaluate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal melakukan evaluasi");
      }

      const result = await response.json();
      setEvaluation(result.evaluation);
    } catch (error) {
      console.error("Error evaluating interview:", error);
      setError("Gagal melakukan evaluasi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-emerald-600";
    if (grade.startsWith("B")) return "text-blue-600";
    if (grade.startsWith("C")) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Navbar />

      <div className="pt-24 pb-16 container mx-auto px-4 max-w-5xl">
        {/* --- HEADER SECTION --- */}
        <div className="mb-8">
          <Link
            href="/interview"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Kembali ke Dashboard
            Interview
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                Hasil Evaluasi Interview
              </h1>
              <p className="text-gray-500">
                Analisis mendalam performa dan saran perbaikan dari AI.
              </p>
            </div>

            {/* Header Actions (Only show if loaded) */}
            {evaluation && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-gray-200 text-gray-700"
                >
                  <Share2 className="w-4 h-4 mr-2" /> Bagikan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-white border-gray-200 text-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" /> PDF
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* --- STATE 1: EMPTY / NO ID --- */}
        {!evaluation && !loading && !error && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Data Tidak Ditemukan
            </h3>
            <p className="text-gray-500 mb-6">
              Silakan selesaikan sesi interview terlebih dahulu.
            </p>
            <Button
              onClick={() => router.push("/interview")}
              className="bg-black hover:bg-blue-700 text-white"
            >
              Mulai Interview Baru
            </Button>
          </div>
        )}

        {/* --- STATE 2: LOADING --- */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Menganalisis Jawaban...
            </h3>
            <p className="text-gray-500 text-sm">
              Mohon tunggu, AI sedang menyusun laporan evaluasi Anda.
            </p>
          </div>
        )}

        {/* --- STATE 3: ERROR --- */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Button
              onClick={evaluateInterview}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Coba Lagi
            </Button>
          </div>
        )}

        {/* --- STATE 4: SUCCESS (CONTENT) --- */}
        {evaluation && !loading && !error && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. Overall Score Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <OverallCard
                evaluation={evaluation}
                gradeColor={getGradeColor}
                scoreColor={getScoreColor}
              />
            </div>

            {/* 2. Recommendations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                Rekomendasi Perbaikan
              </h3>
              <Recommendations recommendations={evaluation.recommendations} />
            </div>

            {/* 3. Detailed Breakdown */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 px-1">
                <FileText className="w-5 h-5 text-gray-500" />
                Analisis Jawaban per Soal
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {evaluation.evaluations.map((data, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
                  >
                    <EvaluationCard data={data} scoreColor={getScoreColor} />
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t border-gray-200 mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/interview")}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12 px-8"
              >
                Kembali ke Menu
              </Button>
              <Button
                size="lg"
                onClick={() => router.push("/interview/setup")}
                className="bg-black hover:bg-blue-700 text-white shadow-lg  h-12 px-8"
              >
                Mulai Interview Baru
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
