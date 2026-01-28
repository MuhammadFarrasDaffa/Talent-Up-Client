"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { OverallCard } from "./components/OverallCard";
import { EvaluationCard } from "./components/EvaluationCard";
import { Recommendations } from "./components/Recommendations";
import { StateCard } from "./components/StateCard";
import { InterviewEvaluation } from "@/types";
import Navbar from "@/components/layout/Navbar";

export default function InterviewEvaluationPage() {
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

      // Call API untuk evaluate interview
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
    if (grade.startsWith("A")) return "text-green-600";
    if (grade.startsWith("B")) return "text-blue-600";
    if (grade.startsWith("C")) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-6">
      <Navbar />
      <div className="max-w-6xl mx-auto mt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Interview Performance Evaluation
          </h1>
          <p className="text-gray-600 text-lg">
            Detailed analysis of your interview performance
          </p>
        </div>
        {!evaluation && !loading && !error && (
          <StateCard
            icon="📊"
            title="No Interview Data"
            message="Silakan selesaikan interview terlebih dahulu untuk melihat evaluasi"
            actionLabel="Start Interview"
            onAction={() => (window.location.href = "/interviews")}
            primary
          />
        )}

        {loading && (
          <StateCard
            icon="⏳"
            title="Processing"
            message="Analyzing your performance..."
          />
        )}

        {error && !loading && (
          <StateCard
            icon="⚠️"
            title="Error"
            message={error}
            actionLabel="Try Again"
            onAction={evaluateInterview}
          />
        )}

        {evaluation && !loading && !error && (
          <div className="space-y-6">
            <OverallCard
              evaluation={evaluation}
              gradeColor={getGradeColor}
              scoreColor={getScoreColor}
            />

            <div className="grid grid-cols-1 gap-6">
              {evaluation.evaluations.map((data, index) => (
                <EvaluationCard
                  key={index}
                  data={data}
                  scoreColor={getScoreColor}
                />
              ))}
            </div>

            <Recommendations recommendations={evaluation.recommendations} />

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => (window.location.href = "/interview")}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Start New Interview
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Download Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
