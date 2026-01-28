"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  ArrowRight,
  UserCog,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { aiService } from "@/services/aiService";
import { profileService } from "@/services/profileService";
import StarBorder from "@/components/ui/StarBorder";

interface JobAIAnalysisProps {
  jobId: string;
}

export default function JobAIAnalysis({ jobId }: JobAIAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State baru untuk handle profile belum lengkap
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);

  useEffect(() => {
    // Cek login saat mount
    setIsLoggedIn(!!localStorage.getItem("user"));
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setIsProfileIncomplete(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      // --- 1. FETCH PROFILE DATA DARI API (bukan localStorage) ---
      const { profile } = await profileService.getProfile();

      // --- 2. VALIDASI KELENGKAPAN PROFILE ---
      // Cek apakah ada Skill ATAU Pengalaman
      const hasSkills = profile.skills && profile.skills.length > 0;
      const hasExperience = profile.experience && profile.experience.length > 0;

      if (!hasSkills && !hasExperience) {
        setIsProfileIncomplete(true);
        setLoading(false);
        return; // Stop proses, jangan panggil API
      }

      // --- 3. JIKA LENGKAP, LANJUT ANALISIS ---
      // Transform skills: array of objects { name: string } -> array of strings
      const skillsArray = (profile.skills || []).map((skill: any) =>
        typeof skill === "string" ? skill : skill.name,
      );

      const userProfilePayload = {
        name: profile.fullName || "Professional",
        title: profile.title || "Professional",
        summary: profile.summary || "",
        skills: skillsArray,
        experience: profile.experience || [],
        education: profile.education || [],
      };

      const aiResult = await aiService.analyzeMatch(jobId, userProfilePayload);
      setResult(aiResult);
    } catch (err: any) {
      console.error(err);
      // Handle berbagai jenis error
      if (err.message?.includes("Please login") || err.status === 401) {
        setIsLoggedIn(false);
        setError("Sesi login telah berakhir. Silakan login kembali.");
      } else if (err.message?.includes("Failed to get profile")) {
        setError("Gagal mengambil data profil. Pastikan server berjalan.");
      } else {
        setError("Terjadi kesalahan koneksi AI. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- VIEW 1: BELUM LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-5 text-center">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
        <h4 className="text-sm font-bold text-gray-900">Fitur Terkunci</h4>
        <p className="text-xs text-gray-500 mb-4 mt-1">
          Masuk untuk analisis kecocokan AI.
        </p>
        <Link href="/login">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 text-xs bg-white hover:bg-gray-100"
          >
            Masuk Akun
          </Button>
        </Link>
      </div>
    );
  }

  // --- VIEW 2: PROFILE BELUM LENGKAP (Warning State) ---
  if (isProfileIncomplete) {
    return (
      <Card className="border border-orange-200 bg-orange-50/50 shadow-sm overflow-hidden">
        <CardContent className="p-5 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
            <UserCog className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">
            Profil Belum Lengkap
          </h3>
          <p className="text-xs text-gray-600 mt-2 mb-4 leading-relaxed">
            AI membutuhkan data <strong>Skill</strong> atau{" "}
            <strong>Pengalaman</strong> kamu untuk melakukan analisis yang
            akurat.
          </p>

          <div className="space-y-2">
            <Link href="/profile">
              <Button className="w-full h-9 text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200">
                Lengkapi Profil
              </Button>
            </Link>
            <Button
              onClick={() => setIsProfileIncomplete(false)}
              variant="ghost"
              size="sm"
              className="w-full h-8 text-[10px] text-gray-400 hover:text-gray-600"
            >
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- VIEW 3: HASIL ANALISIS (RESULT) ---
  if (result) {
    const scoreColor =
      result.matchPercentage >= 70
        ? "bg-emerald-500"
        : result.matchPercentage >= 50
          ? "bg-orange-500"
          : "bg-red-500";

    return (
      <div className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-lg relative ring-1 ring-black/5">
        {/* Top Score Bar */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${scoreColor}`} />

        <div className="p-5">
          {/* Header: Score & Close Button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl ${scoreColor} flex items-center justify-center text-white shadow-md`}
              >
                <span className="font-bold text-lg">
                  {result.matchPercentage}%
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">
                  MATCH SCORE
                </div>
                <div className="text-xs text-gray-500">
                  Berdasarkan profil kamu
                </div>
              </div>
            </div>
            <Button
              onClick={() => setResult(null)}
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          {/* Summary/Reasoning */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 rounded-xl border border-slate-200 mb-5">
            <p className="text-sm text-slate-700 leading-relaxed">
              {result.reasoning}
            </p>
          </div>

          {/* Matching Points Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900">
                Kelebihan Kamu
              </h4>
            </div>
            <div className="space-y-2 pl-8">
              {result.matchingSkills?.length > 0 ? (
                result.matchingSkills.map((point: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-700 bg-emerald-50/50 px-3 py-2 rounded-lg border border-emerald-100"
                  >
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{point}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Tidak ada poin kelebihan spesifik yang terdeteksi.
                </p>
              )}
            </div>
          </div>

          {/* Missing Points / Improvement Section */}
          {result.missingSkills?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Perlu Ditingkatkan
                </h4>
              </div>
              <div className="space-y-2 pl-8">
                {result.missingSkills.map((point: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-700 bg-orange-50/50 px-3 py-2 rounded-lg border border-orange-100"
                  >
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW 4: INITIAL STATE (READY) ---
  return (
    <StarBorder as="div" className="w-full" color="magenta" speed="5s">
      <div className="p-5 flex flex-col items-center text-center bg-slate-950/95 backdrop-blur-xl w-full h-full rounded-[20px] relative overflow-hidden">
        {/* Background Glow Effect */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_50%)] pointer-events-none" />

        <div className="relative z-10 w-full">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h3 className="text-white font-bold text-sm tracking-tight">
              AI Match Analyzer
            </h3>
          </div>

          <p className="text-slate-400 text-[11px] mb-5 leading-snug px-2">
            Analisis kecocokan Skill & Pengalamanmu dengan lowongan ini secara
            instan.
          </p>

          {error && (
            <div className="mb-3 text-[10px] text-red-300 bg-red-900/30 px-2 py-1.5 rounded border border-red-500/20 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-3 h-3" /> {error}
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            size="sm"
            className="w-full bg-white text-slate-950 hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] font-bold text-xs h-9 rounded-lg transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menganalisis...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Analisis Sekarang <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </StarBorder>
  );
}
