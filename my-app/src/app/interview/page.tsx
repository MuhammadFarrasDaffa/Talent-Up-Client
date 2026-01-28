"use client";

import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit,
  Mic,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Users,
} from "lucide-react";
import Link from "next/link";
import RotatingText from "@/components/ui/RotatingText";
import DotGrid from "@/components/ui/DotGrid";

export default function InterviewLandingPage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Navbar />

      {/* --- HERO SECTION WITH DOTGRID BACKGROUND --- */}
      <section className="relative min-h-[90vh] overflow-hidden">
        {/* Background DotGrid - hanya untuk hero section */}
        <div className="absolute inset-0 w-full h-full z-0">
          <DotGrid
            dotSize={5}
            gap={15}
            baseColor="#fafaff"
            activeColor="#5227FF"
            proximity={170}
            speedTrigger={100}
            shockRadius={250}
            shockStrength={5}
            maxSpeed={5000}
            resistance={750}
            returnDuration={1.5}
          />
        </div>

        {/* Hero Content (Overlay) */}
        <div className="relative pt-32 pb-24 md:pt-40 md:pb-32 container mx-auto px-4 z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Interview Simulator V2.0</span>
            </div>

            {/* Headline dengan Rotating Text */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Latih Interview <br className="hidden md:block" />
              <span className="inline-flex items-center justify-center align-middle">
                untuk Posisi
                <span className="ml-3 px-3 md:px-4 py-0 md:py-1 bg-black text-white rounded-xl rotate-1 md:rotate-2 shadow-xl inline-block overflow-hidden">
                  <RotatingText
                    texts={[
                      "Frontend Dev",
                      "Backend Dev",
                      "UI/UX Design",
                      "Data Analyst",
                      "Product Mgr",
                    ]}
                    mainClassName="text-white text-3xl md:text-5xl font-mono"
                    staggerFrom="last"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={3000}
                  />
                </span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Dapatkan pengalaman wawancara kerja yang nyata dengan feedback
              instan dari AI. Tingkatkan percaya diri dan teknik menjawabmu
              sekarang.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <Link href="/interview/setup">
                <Button className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 group w-full sm:w-auto">
                  Mulai Simulasi{" "}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="h-14 px-8 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium text-lg w-full sm:w-auto"
              >
                <Zap className="mr-2 w-5 h-5 text-amber-500" /> Lihat Demo
              </Button>
            </div>

            {/* Stats / Trust */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap justify-center gap-8 md:gap-16 text-slate-400 animate-in fade-in duration-1000 delay-500 opacity-0 fill-mode-forwards">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">10,000+ Pertanyaan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">
                  Feedback Suara & Teks
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">
                  Analisis STAR Method
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID (Minimalist) --- */}
      <div className="relative z-10 py-24 bg-slate-50/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Mic className="w-6 h-6 text-white" />}
              color="bg-orange-500"
              title="Simulasi Suara"
              desc="Berbicara langsung dengan AI. Latih intonasi dan kecepatan bicara agar terdengar natural dan percaya diri."
            />
            <FeatureCard
              icon={<BrainCircuit className="w-6 h-6 text-white" />}
              color="bg-indigo-600"
              title="Analisis Cerdas"
              desc="AI menganalisis jawabanmu berdasarkan kata kunci, struktur kalimat, dan relevansi dengan pertanyaan."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-white" />}
              color="bg-emerald-500"
              title="Role-Play Nyata"
              desc="Pilih persona pewawancara (HR, User, Manager) untuk merasakan berbagai gaya wawancara."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component untuk Card Fitur
function FeatureCard({
  icon,
  color,
  title,
  desc,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div
        className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-gray-200/50`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}
