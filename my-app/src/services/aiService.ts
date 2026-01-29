// src/services/aiService.ts
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export interface AnalyzeMatchResult {
  matchPercentage: number;
  reasoning: string;
  matchingSkills: string[];
  missingSkills: string[];
  tokenUsed?: number;
  remainingToken?: number;
}

export const aiService = {
  analyzeMatch: async (
    jobId: string,
    userProfile: any,
  ): Promise<AnalyzeMatchResult> => {
    try {
      const token = localStorage.getItem("token"); // Ambil token auth

      const res = await fetch(`${API_URL}/jobs/${jobId}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Kirim token jika perlu
        },
        // Sesuaikan struktur body dengan request di JobController.js
        body: JSON.stringify({
          userProfile: {
            profile: userProfile,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle insufficient token error
        if (data.code === "INSUFFICIENT_TOKEN") {
          const error: any = new Error(data.message);
          error.code = data.code;
          error.currentBalance = data.currentBalance;
          error.requiredToken = data.requiredToken;
          throw error;
        }
        throw new Error(data.message || "Gagal menganalisis kecocokan.");
      }

      // Map response fields from backend to frontend expected format
      const result = data.data;
      return {
        matchPercentage: result.matchScore,
        reasoning: result.matchExplanation,
        matchingSkills: result.matchingPoints || [],
        missingSkills: result.missingPoints || [],
        tokenUsed: data.tokenUsed,
        remainingToken: data.remainingToken,
      };
    } catch (error: any) {
      throw error;
    }
  },
};
