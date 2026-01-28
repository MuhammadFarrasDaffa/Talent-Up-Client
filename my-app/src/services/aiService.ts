// src/services/aiService.ts
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const aiService = {
  analyzeMatch: async (jobId: string, userProfile: any) => {
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
        throw new Error(data.message || "Gagal menganalisis kecocokan.");
      }

      // Map response fields from backend to frontend expected format
      const result = data.data;
      return {
        matchPercentage: result.matchScore,
        reasoning: result.matchExplanation,
        matchingSkills: result.matchingPoints || [],
        missingSkills: result.missingPoints || [],
      };
    } catch (error: any) {
      throw error;
    }
  },
};
