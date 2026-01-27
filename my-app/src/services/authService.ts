const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const authService = {
  // --- LOGIN ---
  login: async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  },

  // --- REGISTER ---
  register: async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  },

  // --- GOOGLE AUTH ---
  googleAuth: async (credential: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google authentication failed");
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  },
};
