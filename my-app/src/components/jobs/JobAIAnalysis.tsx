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
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { aiService } from "@/services/aiService";
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
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);

      // --- 1. VALIDASI KELENGKAPAN PROFILE ---
      // Kita anggap profile "kosong" jika tidak ada Skill ATAU Pengalaman
      // Anda bisa sesuaikan kondisinya (misal: wajib ada CV url, dsb)
      const hasSkills = user.skills && user.skills.length > 0;
      const hasExperience = user.experience && user.experience.length > 0;

      if (!hasSkills && !hasExperience) {
        setIsProfileIncomplete(true);
        setLoading(false);
        return; // Stop proses, jangan panggil API
      }

      // --- 2. JIKA LENGKAP, LANJUT ANALISIS ---
      const userProfilePayload = {
        name: user.name,
        title: user.jobTitle || "Professional",
        skills: user.skills || [],
        experience: user.experience || [],
        education: user.education || [],
      };

      const aiResult = await aiService.analyzeMatch(jobId, userProfilePayload);
      setResult(aiResult);
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan koneksi AI. Silakan coba lagi.");
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
            <Link href="/profile/edit">
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
    return (
      <div className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-lg relative ring-1 ring-black/5">
        <div
          className={`absolute top-0 left-0 w-full h-1 ${result.matchPercentage >= 70 ? "bg-emerald-500" : "bg-orange-500"}`}
        />

        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
                <span className="font-bold text-sm">
                  {result.matchPercentage}%
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  Match Score
                </div>
                <div className="text-[10px] text-gray-500">
                  Based on your profile
                </div>
              </div>
            </div>
            <Button
              onClick={() => setResult(null)}
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
            <p className="text-xs text-slate-700 italic leading-relaxed">
              "{result.reasoning}"
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {result.matchingSkills?.length > 0 ? (
                  result.matchingSkills.map((s: string, i: number) => (
                    <Badge
                      key={i}
                      className="bg-white border border-emerald-100 text-emerald-700 shadow-sm text-[10px] px-2 py-0"
                    >
                      {s}
                    </Badge>
                  ))
                ) : (
                  <span className="text-[10px] text-gray-400">
                    Tidak ada skill spesifik.
                  </span>
                )}
              </div>
            </div>

            {result.missingSkills?.length > 0 && (
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                </div>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {result.missingSkills.map((s: string, i: number) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-red-600 bg-red-50/50 border-red-100 text-[10px] px-2 py-0"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 4: INITIAL STATE (READY) ---
  return (
    <StarBorder as="div" className="w-full" color="#6366f1" speed="5s">
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
