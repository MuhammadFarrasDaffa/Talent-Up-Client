"use client";

// import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Category, InterviewConfig } from "@/types";
import Navbar from "@/components/layout/Navbar";

export default function Interview() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedLevel, setSelectedLevel] = useState<
    "junior" | "middle" | "senior" | null
  >(null);
  const [selectedTier, setSelectedTier] = useState<"free" | "premium" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoadingCategories(true);
        const response = await fetch(
          "http://localhost:3000/questions/categories",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        setCategories((data || []).filter((c: Category) => c.published));
      } catch (error) {
        console.error("Error fetching categories:", error);
        alert("Failed to load categories. Please try again later.");
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  const levels = [
    {
      value: "junior" as const,
      title: "Junior",
      description: "0-2 years experience",
      color: "bg-green-500",
    },
    {
      value: "middle" as const,
      title: "Middle",
      description: "2-5 years experience",
      color: "bg-blue-500",
    },
    {
      value: "senior" as const,
      title: "Senior",
      description: "5+ years experience",
      color: "bg-purple-500",
    },
  ];

  const tiers = [
    {
      value: "free" as const,
      title: "Free",
      questions: 5,
      price: "Free",
      features: ["5 Questions", "Basic Feedback", "Text Transcript"],
      token: 1,
    },
    {
      value: "premium" as const,
      title: "Premium",
      questions: 20,
      price: "$9.99",
      features: [
        "20 Questions",
        "Detailed Feedback",
        "AI Analysis",
        "Performance Report",
      ],
      badge: "Popular",
      token: 2,
    },
  ];

  const handleShowConfirmation = () => {
    if (!selectedCategory || !selectedLevel || !selectedTier) {
      alert("Please select category, level, and tier");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleStartInterview = async () => {
    if (!selectedCategory || !selectedLevel || !selectedTier) {
      alert("Please select category, level, and tier");
      return;
    }

    const config: InterviewConfig = {
      categoryId: selectedCategory._id,
      categoryTitle: selectedCategory.title,
      level: selectedLevel,
      tier: selectedTier,
      tokenUsage: tiers.find((t) => t.value === selectedTier)?.token || 1,
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

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // Check if response is error object or valid questions array
      if (data.message || data.error || !Array.isArray(data)) {
        throw new Error(
          data.message ||
            data.error ||
            "Invalid data format received from server",
        );
      }

      // Validate questions array
      if (data.length === 0) {
        throw new Error("No questions available for selected configuration");
      }

      console.log("Interview started:", data);

      // Simpan ke sessionStorage
      const interviewData = {
        config,
        questions: data,
      };

      sessionStorage.setItem("interviewData", JSON.stringify(interviewData));

      // Verify data tersimpan
      const verified = sessionStorage.getItem("interviewData");
      console.log(
        "Verified sessionStorage:",
        verified ? "Data saved" : "Failed to save",
      );

      // Navigate dengan Next.js router setelah memastikan data tersimpan
      setTimeout(() => {
        router.push("/interviews/room");
      }, 100);
    } catch (error) {
      console.error("Error starting interview:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start interview";
      alert(`Failed to start interview: ${errorMessage}`);
      setLoading(false);
    }
  };

  const canStart = selectedCategory && selectedLevel && selectedTier;

  const isLevelEnabled = (level: "junior" | "middle" | "senior") => {
    return Boolean(selectedCategory?.level?.[level]);
  };

  // Reset invalid selections when category changes
  useEffect(() => {
    if (selectedCategory && selectedLevel && !isLevelEnabled(selectedLevel)) {
      setSelectedLevel(null);
      setSelectedTier(null);
    }
  }, [selectedCategory]);

  // Fetch available question count based on selected category and level
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
        console.error("Error fetching question count", err);
        setAvailableCount(0);
      } finally {
        setLoadingCount(false);
      }
    };
    fetchCount();
  }, [selectedCategory?._id, selectedLevel]);

  // Reset tier if currently selected tier exceeds available questions
  useEffect(() => {
    if (selectedTier && availableCount !== null) {
      const currentTier = tiers.find((t) => t.value === selectedTier);
      if (currentTier && currentTier.questions > availableCount) {
        setSelectedTier(null);
      }
    }
  }, [availableCount, selectedTier]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-6">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            AI Interview Simulator
          </h1>
          <p className="text-gray-600 text-lg">
            Choose your category, level, and tier to start your interview
            practice
          </p>
        </div>

        {/* Step 1: Category Selection */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              1
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Select Category
            </h2>
          </div>

          {loadingCategories ? (
            <div className="flex items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
              <span className="ml-3 text-gray-600">Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
              <p className="text-gray-600">No categories available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedCategory?._id === category._id
                      ? "border-blue-600 bg-blue-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
                  {selectedCategory?._id === category._id && (
                    <div className="mt-3 flex items-center gap-2 text-blue-600 font-medium">
                      <span>✓</span>
                      <span>Selected</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Level Selection */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                selectedCategory
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500"
              }`}
            >
              2
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Select Level</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {levels.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelectedLevel(level.value)}
                disabled={!selectedCategory || !isLevelEnabled(level.value)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedLevel === level.value
                    ? "border-blue-600 bg-blue-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                } ${
                  !selectedCategory || !isLevelEnabled(level.value)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full ${level.color} text-white flex items-center justify-center font-bold text-lg mb-4`}
                >
                  {level.title[0]}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {level.title}
                </h3>
                <p className="text-sm text-gray-600">{level.description}</p>
                {selectedCategory && !isLevelEnabled(level.value) && (
                  <div className="mt-3 text-xs font-medium text-gray-500">
                    Unavailable for this category
                  </div>
                )}
                {selectedLevel === level.value && (
                  <div className="mt-3 flex items-center gap-2 text-blue-600 font-medium">
                    <span>✓</span>
                    <span>Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Tier Selection */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                selectedLevel
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500"
              }`}
            >
              3
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Select Tier</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {tiers.map((tier) => (
              <button
                key={tier.value}
                onClick={() => setSelectedTier(tier.value)}
                disabled={
                  !selectedLevel ||
                  (availableCount !== null && tier.questions > availableCount)
                }
                className={`p-8 rounded-xl border-2 transition-all relative ${
                  selectedTier === tier.value
                    ? "border-blue-600 bg-blue-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                } ${
                  !selectedLevel ||
                  (availableCount !== null && tier.questions > availableCount)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 right-6 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {tier.badge}
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {tier.title}
                  </h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {tier.price}
                  </div>
                  <p className="text-sm text-gray-600">
                    {tier.questions} Questions per session
                  </p>
                  <p className="text-sm text-gray-600">
                    {tier.token} Tokens per session
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <span className="text-green-600">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {selectedLevel &&
                  availableCount !== null &&
                  tier.questions > availableCount && (
                    <div className="mt-2 text-xs font-medium text-gray-500">
                      Not enough questions available ({availableCount})
                    </div>
                  )}

                {selectedTier === tier.value && (
                  <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                    <span>✓</span>
                    <span>Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Summary & Start Button */}
        {canStart && (
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Interview Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Category</p>
                <p className="font-semibold text-gray-800">
                  {selectedCategory?.icon} {selectedCategory?.title}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Level</p>
                <p className="font-semibold text-gray-800 capitalize">
                  {selectedLevel}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Tier</p>
                <p className="font-semibold text-gray-800 capitalize">
                  {selectedTier} (
                  {tiers.find((t) => t.value === selectedTier)?.questions}{" "}
                  Questions)
                </p>
              </div>
            </div>

            <button
              onClick={handleShowConfirmation}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading loading-spinner"></span>
                  Starting Interview...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🎯 Start Interview
                </span>
              )}
            </button>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto animate-scaleIn">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Before You Start
                </h3>
                <p className="text-gray-600">
                  Please read the following information carefully
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📋</span>
                  <span>Important Guidelines</span>
                </h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>No Browser Navigation:</strong> You cannot go back
                      or refresh the page during the interview. Your progress
                      will be lost if you do.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Audio Recording Required:</strong> Please allow
                      microphone access when prompted. You will answer questions
                      verbally.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Stable Internet Connection:</strong> Ensure you
                      have a stable internet connection throughout the
                      interview.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Quiet Environment:</strong> Find a quiet place to
                      ensure clear audio recording for better evaluation.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Estimated Time:</strong> The interview will take
                      approximately{" "}
                      {tiers.find((t) => t.value === selectedTier)?.questions ||
                        0}{" "}
                      * 2-3 minutes. Please allocate enough time.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Disclaimer:</strong> This is an AI-powered mock
                  interview. The evaluation is automated and should be used as a
                  practice tool only. Results may not reflect actual interview
                  performance.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartInterview}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Starting...</span>
                    </span>
                  ) : (
                    "I Understand, Start Interview"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
