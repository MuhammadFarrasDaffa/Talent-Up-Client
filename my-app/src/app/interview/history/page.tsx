"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Trophy,
  Eye,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";

interface Question {
  _id: string;
  content: string;
  type: string;
  level: string;
  followUp: boolean;
}

interface Answer {
  questionId: string;
  question: string;
  transcription: string;
  duration: number;
  isFollowUp: boolean;
  acknowledgment?: string;
}

interface InterviewHistoryItem {
  _id: string;
  category: string;
  level: string;
  tier: string;
  completedAt: string;
  evaluated: boolean;
  questions: Question[];
  answers: Answer[];
  evaluation?: {
    overallScore: number;
    overallGrade: string;
  };
}

export default function InterviewHistoryPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedInterviews, setExpandedInterviews] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  const fetchInterviewHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/interviews/history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch interview history");
      }

      const data = await response.json();
      setInterviews(data.interviews);
    } catch (error) {
      console.error("Error fetching interview history:", error);
      setError("Gagal memuat riwayat interview. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "junior":
        return "bg-green-100 text-green-800 border-green-300";
      case "senior":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "middle":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTierColor = (tier: string) => {
    return tier.toLowerCase() === "premium"
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : "bg-slate-100 text-slate-800 border-slate-300";
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600";
    if (grade.startsWith("B")) return "text-blue-600";
    if (grade.startsWith("C")) return "text-yellow-600";
    return "text-red-600";
  };

  const handleViewEvaluation = (interviewId: string) => {
    router.push(`/interview/evaluate?id=${interviewId}`);
  };

  const toggleExpand = (interviewId: string) => {
    setExpandedInterviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(interviewId)) {
        newSet.delete(interviewId);
      } else {
        newSet.add(interviewId);
      }
      return newSet;
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Interview History
          </h1>
          <p className="text-gray-600">
            Lihat semua interview yang sudah Anda selesaikan
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {interviews.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Belum Ada Interview
              </h3>
              <p className="text-gray-600 mb-6">
                Anda belum menyelesaikan interview apapun.
              </p>
              <Button
                onClick={() => router.push("/interview")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Mulai Interview
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <Card
                key={interview._id}
                className="p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Section - Interview Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {interview.category}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge
                            className={`${getLevelColor(interview.level)} border`}
                          >
                            {interview.level}
                          </Badge>
                          <Badge
                            className={`${getTierColor(interview.tier)} border`}
                          >
                            {interview.tier}
                          </Badge>
                          {interview.evaluated && (
                            <Badge className="bg-green-50 text-green-700 border border-green-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Evaluated
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(interview.completedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Evaluation Score */}
                    {interview.evaluated && interview.evaluation && (
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Score:</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {interview.evaluation.overallScore}
                          </span>
                          <span className="text-sm text-gray-500">/100</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Grade:</span>
                          <span
                            className={`text-2xl font-bold ${getGradeColor(interview.evaluation.overallGrade)}`}
                          >
                            {interview.evaluation.overallGrade}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex flex-col gap-2 md:items-end">
                    <Button
                      onClick={() => handleViewEvaluation(interview._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {interview.evaluated
                        ? "Lihat Evaluasi"
                        : "Evaluate Interview"}
                    </Button>

                    {/* Toggle Details Button */}
                    <Button
                      onClick={() => toggleExpand(interview._id)}
                      variant="outline"
                      className="border-gray-300"
                    >
                      {expandedInterviews.has(interview._id) ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Sembunyikan Detail
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          Lihat Detail
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Section - Questions & Answers */}
                {expandedInterviews.has(interview._id) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Questions & Answers ({interview.answers?.length || 0})
                    </h4>

                    <div className="space-y-4">
                      {interview.answers?.map((answer, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          {/* Question */}
                          <div className="mb-3">
                            <div className="flex items-start gap-2 mb-2">
                              <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                                Q{index + 1}
                              </Badge>
                              {answer.isFollowUp && (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs">
                                  Follow-up
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-900 font-medium">
                              {answer.question}
                            </p>
                          </div>

                          {/* Answer */}
                          <div className="ml-4 pl-4 border-l-2 border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                                A{index + 1}
                              </Badge>
                              {answer.duration > 0 && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(answer.duration)}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm">
                              {answer.transcription}
                            </p>

                            {/* Acknowledgment */}
                            {answer.acknowledgment && (
                              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-100">
                                <p className="text-xs text-blue-800 italic">
                                  💬 {answer.acknowledgment}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
