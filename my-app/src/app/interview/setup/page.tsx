"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Category, InterviewConfig } from "@/types";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card"; // Gunakan UI Card kita
import { Button } from "@/components/ui/button"; // Gunakan UI Button kita
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface Tier {
  _id: string;
  title: string;
  price: number;
  benefits: string[];
  quota: number;
  description: string;
}

export default function InterviewSetupPage() {
  const router = useRouter();

  // --- STATE MANAGEMENT (ASLI DARI KODE ANDA) ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedLevel, setSelectedLevel] = useState<
    "junior" | "middle" | "senior" | null
  >(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- FETCHING LOGIC (ASLI) ---
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoadingCategories(true);
        // Note: Pastikan URL ini sesuai dengan env di production nanti
        const response = await fetch(
          "http://localhost:3000/questions/categories",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          },
        );
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories((data || []).filter((c: Category) => c.published));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchTiers() {
      try {
        setLoadingTiers(true);
        const response = await fetch("http://localhost:3000/tiers", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch tiers");
        const data = await response.json();
        setTiers(data.tiers || []);
      } catch (error) {
        console.error("Error fetching tiers:", error);
      } finally {
        setLoadingTiers(false);
      }
    }
    fetchTiers();
  }, []);

  const levels = [
    {
      value: "junior" as const,
      title: "Junior",
      description: "0-2 tahun pengalaman",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    {
      value: "middle" as const,
      title: "Middle",
      description: "2-5 tahun pengalaman",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      value: "senior" as const,
      title: "Senior",
      description: "5+ tahun pengalaman",
      color: "bg-purple-100 text-purple-700 border-purple-200",
    },
  ];

  // --- LOGIC HANDLERS (ASLI) ---
  const handleShowConfirmation = () => {
    if (!selectedCategory || !selectedLevel || !selectedTier) return;
    setShowConfirmModal(true);
  };

  const handleStartInterview = async () => {
    if (!selectedCategory || !selectedLevel || !selectedTier) return;
    const selectedTierData = tiers.find((t) => t._id === selectedTier);
    if (!selectedTierData) return;

    const config: InterviewConfig = {
      categoryId: selectedCategory._id,
      categoryTitle: selectedCategory.title,
      level: selectedLevel,
      tier: selectedTierData.title.toLowerCase().includes("free")
        ? "free"
        : "premium",
      tokenUsage: selectedTierData.price,
    };

    setLoading(true);
    setShowConfirmModal(false);

    try {
      const response = await fetch("http://localhost:3000/interviews/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();

      if (data.message || data.error || !Array.isArray(data)) {
        throw new Error(data.message || data.error || "Invalid data format");
      }
      if (data.length === 0) throw new Error("No questions available");

      sessionStorage.setItem(
        "interviewData",
        JSON.stringify({ config, questions: data }),
      );
      setTimeout(() => router.push("/interview/room"), 100);
    } catch (error: any) {
      console.error(error);
      alert(`Gagal memulai: ${error.message}`);
      setLoading(false);
    }
  };

  const isLevelEnabled = (level: "junior" | "middle" | "senior") => {
    return Boolean(selectedCategory?.level?.[level]);
  };

  // Effects Logic
  useEffect(() => {
    if (selectedCategory && selectedLevel && !isLevelEnabled(selectedLevel)) {
      setSelectedLevel(null);
      setSelectedTier(null);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const fetchCount = async () => {
      if (!selectedCategory || !selectedLevel) {
        setAvailableCount(null);
        return;
      }
      try {
        setLoadingCount(true);
        const params = new URLSearchParams({
          categoryId: selectedCategory._id,
          level: selectedLevel,
        });
        const res = await fetch(
          `http://localhost:3000/questions/count?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          },
        );
        const data = await res.json();
        setAvailableCount(Number(data?.count ?? 0));
      } catch (err) {
        setAvailableCount(0);
      } finally {
        setLoadingCount(false);
      }
    };
    fetchCount();
  }, [selectedCategory?._id, selectedLevel]);

  useEffect(() => {
    if (selectedTier && availableCount !== null && tiers.length > 0) {
      const currentTier = tiers.find((t) => t._id === selectedTier);
      if (currentTier && currentTier.quota > availableCount) {
        setSelectedTier(null);
      }
    }
  }, [availableCount, selectedTier, tiers]);

  const canStart = selectedCategory && selectedLevel && selectedTier;

  // --- UI RENDER ---
  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Navbar />

      <div className="pt-24 pb-12 container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/interview"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Kembali ke Landing Page
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Setup Interview Room
          </h1>
          <p className="text-gray-500 mt-2">
            Sesuaikan parameter wawancara sesuai kebutuhan latihanmu.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: STEPS */}
          <div className="lg:col-span-8 space-y-8">
            {/* STEP 1: CATEGORY */}
            <Card className="p-6 border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-200">
                  1
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Pilih Posisi / Kategori
                </h2>
              </div>

              {loadingCategories ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => setSelectedCategory(category)}
                      className={`relative p-4 rounded-xl border text-left transition-all ${
                        selectedCategory?._id === category._id
                          ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="font-semibold text-gray-900">
                        {category.title}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {category.description}
                      </div>
                      {selectedCategory?._id === category._id && (
                        <div className="absolute top-4 right-4 text-blue-600">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* STEP 2: LEVEL */}
            <Card
              className={`p-6 border border-gray-200 shadow-sm bg-white transition-opacity ${!selectedCategory ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-200">
                  2
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Pilih Level Senioritas
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {levels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setSelectedLevel(level.value)}
                    disabled={!selectedCategory || !isLevelEnabled(level.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedLevel === level.value
                        ? `border-blue-600 ring-1 ring-blue-600 ${level.color}` // Active Style
                        : "border-gray-200 bg-white hover:border-gray-300"
                    } ${!selectedCategory || !isLevelEnabled(level.value) ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <div className="font-bold mb-1">{level.title}</div>
                    <div className="text-xs opacity-80">
                      {level.description}
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* STEP 3: TIER */}
            <Card
              className={`p-6 border border-gray-200 shadow-sm bg-white transition-opacity ${!selectedLevel ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-200">
                  3
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Pilih Paket Interview
                </h2>
              </div>

              {loadingTiers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tiers.map((tier) => {
                    const isDisabled =
                      !selectedLevel ||
                      (availableCount !== null && tier.quota > availableCount);
                    return (
                      <button
                        key={tier._id}
                        onClick={() => setSelectedTier(tier._id)}
                        disabled={isDisabled}
                        className={`p-6 rounded-xl border-2 text-left transition-all relative ${
                          selectedTier === tier._id
                            ? "border-blue-600 bg-blue-50/50"
                            : "border-gray-100 bg-white hover:border-blue-200"
                        } ${isDisabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {tier.title}
                            </h3>
                            <div className="text-sm font-semibold text-blue-600">
                              {tier.price === 0
                                ? "Gratis"
                                : `${tier.price} Token`}
                            </div>
                          </div>
                          {selectedTier === tier._id && (
                            <CheckCircle2 className="w-6 h-6 text-blue-600" />
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="text-sm text-gray-600">
                            <strong>{tier.quota}</strong> Pertanyaan
                          </div>
                          <p className="text-xs text-gray-500 italic">
                            {tier.description}
                          </p>
                        </div>

                        <ul className="text-xs text-gray-500 space-y-1">
                          {tier.benefits.map((b, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-green-500">✓</span> {b}
                            </li>
                          ))}
                        </ul>

                        {isDisabled && (
                          <div className="mt-3 text-xs text-red-500 bg-red-50 p-2 rounded">
                            Pertanyaan tersedia ({availableCount}) tidak cukup.
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN: SUMMARY & CTA */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <Card className="p-6 border border-blue-100 bg-gradient-to-b from-white to-blue-50/30 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Ringkasan Sesi
              </h3>

              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Kategori</span>
                  <span className="font-medium text-right">
                    {selectedCategory?.title || "-"}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Level</span>
                  <span className="font-medium capitalize">
                    {selectedLevel || "-"}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Paket</span>
                  <span className="font-medium">
                    {tiers.find((t) => t._id === selectedTier)?.title || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-500">Total Biaya</span>
                  <Badge className="bg-blue-600 hover:bg-blue-700">
                    {tiers.find((t) => t._id === selectedTier)?.price ?? 0}{" "}
                    Token
                  </Badge>
                </div>
              </div>

              <Button
                onClick={handleShowConfirmation}
                disabled={!canStart || loading}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" /> Memproses...
                  </>
                ) : (
                  "Mulai Interview"
                )}
              </Button>

              {!canStart && (
                <p className="text-xs text-center text-gray-400 mt-2">
                  Lengkapi semua pilihan di kiri.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <Card className="max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Konfirmasi Persiapan
              </h3>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-6 space-y-2 text-sm text-yellow-800">
              <div className="flex gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <p>Pastikan mikrofon aktif & izinkan akses browser.</p>
              </div>
              <div className="flex gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <p>Cari tempat hening agar suara terekam jelas.</p>
              </div>
              <div className="flex gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <p>Dilarang refresh halaman saat interview berlangsung.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirmModal(false)}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleStartInterview}
                disabled={loading}
              >
                {loading ? "Memuat..." : "Saya Siap, Mulai!"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
