// src/services/aiService.ts
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const aiService = {
  analyzeMatch: async (jobId: string, userProfile: any) => {
    try {
      const token = localStorage.getItem("token"); // Ambil token auth

      const res = await fetch(`${API_URL}/jobs/${jobId}/analyze`, {
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

      return data.data; // Mengembalikan hasil analisis AI
    } catch (error: any) {
      throw error;
    }
  },
};
