const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const jobService = {
  // Update to support pagination & search
  getAllJobs: async (
    page: number = 1,
    limit: number = 9,
    search: string = "",
  ) => {
    try {
      // Create query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append("search", search); // Assuming backend supports ?search=

      const res = await fetch(`${API_URL}/jobs?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Gagal mengambil data lowongan");
      return await res.json();
    } catch (error) {
      console.error(error);
      return { data: [], total: 0, hasMore: false };
    }
  },

  getJobById: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/jobs/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store", // Selalu ambil data fresh
      });

      if (!res.ok) {
        // Jika 404 atau 500, throw error biar ditangkap catch
        throw new Error("Gagal mengambil detail lowongan");
      }

      const json = await res.json();
      return json.data; // Mengembalikan object job tunggal
    } catch (error) {
      console.error(error);
      return null; // Return null jika error agar UI bisa handle (tampilkan not found)
    }
  },
};
