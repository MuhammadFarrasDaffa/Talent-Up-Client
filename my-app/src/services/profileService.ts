const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
import type {
  Profile,
  ProfileFormData,
  Experience,
  Education,
  ParsedResumeData,
} from "@/types";

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper to create a structured error
const createError = async (response: Response, defaultMessage: string) => {
  const error: any = new Error(defaultMessage);
  try {
    const body = await response.json();
    error.message = body.message || defaultMessage;
  } catch (e) {
    // Ignore if body is not json
  }
  error.status = response.status;
  return error;
};

export const profileService = {
  async getProfile(): Promise<{ message: string; profile: Profile }> {
    const response = await fetch(`${API_URL}/profile`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw await createError(response, "Failed to get profile");
    }

    // Cek apakah response adalah JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const error: any = new Error("Server returned invalid response format");
      error.status = response.status;
      throw error;
    }

    return await response.json();
  },

  async createOrUpdateProfile(
    data: Partial<ProfileFormData>,
  ): Promise<{ message: string; profile: Profile }> {
    const response = await fetch(`${API_URL}/profile`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await createError(response, "Failed to update profile");
    }

    return await response.json();
  },

  async addExperience(
    data: Omit<Experience, "_id">,
  ): Promise<{ message: string; profile: Profile }> {
    const response = await fetch(`${API_URL}/profile/experience`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await createError(response, "Failed to add experience");
    }

    return await response.json();
  },

  async addEducation(
    data: Omit<Education, "_id">,
  ): Promise<{ message: string; profile: Profile }> {
    const response = await fetch(`${API_URL}/profile/education`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await createError(response, "Failed to add education");
    }

    return await response.json();
  },

  async addSkill(data: {
    name: string;
  }): Promise<{ message: string; profile: Profile }> {
    const response = await fetch(`${API_URL}/profile/skills`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await createError(response, "Failed to add skill");
    }

    return await response.json();
  },

  parseResume: async (file: File): Promise<ParsedResumeData> => {
    const formData = new FormData();
    formData.append("resume", file);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(`${API_URL}/resume/parse`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Jangan set Content-Type secara manual saat kirim FormData, browser yang atur boundary-nya
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await createError(response, "Gagal memproses CV.");
      throw error;
    }

    const data = await response.json();
    // Backend returns: { success, message, data: { rawTextPreview, parsedProfile: { fullName, email, profile: {...} } } }
    const parsedData = data.data?.parsedProfile;

    if (!parsedData) {
      throw new Error("Data CV tidak valid");
    }

    // Flatten the nested structure to match form fields
    return {
      fullName: parsedData.fullName || "",
      email: parsedData.email || "",
      phone: parsedData.profile?.phone || "",
      title: parsedData.profile?.title || "",
      summary: parsedData.profile?.summary || "",
      location: parsedData.profile?.location || "",
      skills: parsedData.profile?.skills || [],
      education: parsedData.profile?.education || [],
      experience: parsedData.profile?.experience || [],
    };
  },
};

export const aiService = {
  async enhanceSummary(data: {
    fullName?: string;
    summary?: string;
    skills?: { name: string }[];
    experience?: Experience[];
    education?: Education[];
  }): Promise<{ message: string; aiSummary: string }> {
    const response = await fetch(`${API_URL}/cv/enhance-summary`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await createError(response, "Failed to enhance summary");
    }

    return await response.json();
  },

  async optimizeDescription(
    experienceId: string,
    data: { targetRole?: string },
  ): Promise<{
    message: string;
    optimizedDescription: string[];
    experience: Experience;
  }> {
    const response = await fetch(
      `${API_URL}/cv/optimize-description/${experienceId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw await createError(response, "Failed to optimize description");
    }

    return await response.json();
  },

  async suggestSkills(targetRole?: string): Promise<{
    message: string;
    suggestedSkills: string[];
  }> {
    const queryParams = targetRole
      ? `?targetRole=${encodeURIComponent(targetRole)}`
      : "";
    const response = await fetch(`${API_URL}/cv/suggest-skills${queryParams}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw await createError(response, "Failed to suggest skills");
    }

    return await response.json();
  },

  async generateHeadline(data: {
    updateProfile?: boolean;
  }): Promise<{ message: string; headline: string; profile?: Profile }> {
    const response = await fetch(`${API_URL}/cv/generate-headline`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await createError(response, "Failed to generate headline");
    }

    return await response.json();
  },
};
