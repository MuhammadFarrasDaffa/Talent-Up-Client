"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { pdfService } from "@/services/pdfService";
import { profileService, aiService } from "@/services/profileService";
import {
  Download,
  ArrowLeft,
  FileText,
  Loader2,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Wand2,
  CheckCircle2,
  Database,
  Code,
  Heart,
  Laptop,
} from "lucide-react";
import type {
  ProfileFormData,
  Experience,
  Education,
  Profile,
} from "@/types/index";

export default function CVCreatePage() {
  const router = useRouter();
  const [htmlContent, setHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [useProfileData, setUseProfileData] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hasProfileData, setHasProfileData] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      experience: [],
      education: [],
      skills: [],
      certifications: [],
    },
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({ control, name: "experience" });
  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({ control, name: "education" });

  // Watch skills to filter by category
  const allSkills = watch("skills") || [];

  // Helper functions to manage skills by category
  const getSkillsByCategory = (
    category: "hardSkill" | "softSkill" | "tool",
  ) => {
    return allSkills
      .map((skill, index) => ({ ...skill, originalIndex: index }))
      .filter((skill) => skill.category === category);
  };

  const addSkill = (category: "hardSkill" | "softSkill" | "tool") => {
    const currentSkills = watch("skills") || [];
    setValue("skills", [...currentSkills, { name: "", category }]);
  };

  const removeSkillByIndex = (originalIndex: number) => {
    const currentSkills = watch("skills") || [];
    setValue(
      "skills",
      currentSkills.filter((_, index) => index !== originalIndex),
    );
  };

  // Helper function to convert date to YYYY-MM format
  const formatDateToMonth = (
    date: string | Date | null | undefined,
  ): string => {
    if (!date) return "";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    } catch {
      return "";
    }
  };

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { profile } = await profileService.getProfile();
        if (profile && profile.fullName) {
          setHasProfileData(true);
          if (useProfileData) {
            populateFormWithProfile(profile);
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setHasProfileData(false);
      }
    };
    loadProfile();
  }, []);

  const populateFormWithProfile = (profile: Profile) => {
    // Helper to categorize skills if not already categorized
    const categorizeSkill = (
      skill: string | { name: string; category?: string },
    ) => {
      const skillName = typeof skill === "string" ? skill : skill.name;
      const existingCategory =
        typeof skill === "object" ? skill.category : undefined;

      if (existingCategory) {
        return {
          name: skillName,
          category: existingCategory as "hardSkill" | "softSkill" | "tool",
        };
      }

      // Common tools patterns
      const toolPatterns =
        /\b(figma|adobe|photoshop|illustrator|xd|sketch|miro|trello|jira|asana|notion|slack|git|github|gitlab|vscode|vs code|postman|docker|kubernetes|aws|azure|gcp|excel|word|powerpoint|canva|invision|zeplin|abstract|principle|framer|webflow|wordpress|shopify|firebase|mongodb|mysql|postgresql|redis|jenkins|terraform|ansible|linux|windows|macos)\b/i;

      // Common soft skills patterns
      const softSkillPatterns =
        /\b(communication|problem.?solving|critical.?thinking|creative.?thinking|leadership|teamwork|collaboration|collaborative|adaptable|adaptive|flexible|time.?management|organization|organized|interpersonal|emotional.?intelligence|conflict.?resolution|decision.?making|negotiation|presentation|public.?speaking|mentoring|coaching|empathy|patience|motivation|initiative|self.?motivated|detail.?oriented|analytical|fast.?learner|quick.?learner|multitasking|stress.?management|work.?ethic|positive.?attitude|open.?minded|receptive|proactive|reliable|dependable|accountable|trustworthy|honest|integrity|respectful|professional|punctual|diligent|perseverance|resilience|curious|creativity|innovation|strategic.?thinking|planning|prioritization)\b/i;

      if (toolPatterns.test(skillName)) {
        return { name: skillName, category: "tool" as const };
      } else if (softSkillPatterns.test(skillName)) {
        return { name: skillName, category: "softSkill" as const };
      } else {
        return { name: skillName, category: "hardSkill" as const };
      }
    };

    const formattedProfile = {
      ...profile,
      experience: profile.experience?.map((exp: Experience) => ({
        ...exp,
        startDate: formatDateToMonth(exp.startDate),
        endDate: formatDateToMonth(exp.endDate),
      })),
      education: profile.education?.map((edu: Education) => ({
        ...edu,
        startDate: formatDateToMonth(edu.startDate),
        endDate: formatDateToMonth(edu.endDate),
      })),
      skills: profile.skills?.map((s) => categorizeSkill(s)),
    };
    reset(formattedProfile as ProfileFormData);
  };

  // Toggle use profile data
  const handleToggleProfileData = async (checked: boolean) => {
    setUseProfileData(checked);
    if (checked) {
      try {
        const { profile } = await profileService.getProfile();
        if (profile) {
          populateFormWithProfile(profile);
          setMessage("Data profil berhasil dimuat!");
        }
      } catch (error) {
        setMessage("Gagal memuat data profil.");
      }
    } else {
      reset({
        experience: [],
        education: [],
        skills: [],
        certifications: [],
      });
      setMessage("Form dikosongkan. Silakan isi data manual.");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  // Generate AI Summary
  const handleGenerateAISummary = async () => {
    try {
      setIsGeneratingAI(true);
      const formData = watch();
      const skills =
        formData.skills?.map((skill: { name: string }) => ({
          name: skill.name,
        })) || [];
      const { aiSummary } = await aiService.enhanceSummary({
        fullName: formData.fullName,
        summary: formData.summary,
        skills: skills,
        experience: formData.experience,
        education: formData.education,
      });
      setValue("aiSummary", aiSummary);
      setMessage("AI Summary berhasil digenerate!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Gagal generate AI summary. Pastikan data terisi.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Save profile and refresh preview
  const handleSaveAndPreview = async (data: ProfileFormData) => {
    try {
      setIsSavingProfile(true);
      setError("");

      // Save profile first
      await profileService.createOrUpdateProfile(data);
      setMessage("Data tersimpan! Memuat preview...");

      // Then load preview
      await loadPreview();
    } catch (error: any) {
      setError(error.message || "Gagal menyimpan data.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const loadPreview = async () => {
    try {
      setIsLoading(true);
      setError("");
      const html = await pdfService.getPreviewHTML();
      setHtmlContent(html);
      setMessage("Preview berhasil dimuat!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setError(error.message || "Gagal memuat preview CV");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const blob = await pdfService.generatePDF("modern");
      const filename = `CV_Seekers_${Date.now()}.pdf`;
      pdfService.downloadPDF(blob, filename);
      setMessage("CV berhasil diunduh!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setError("Gagal download PDF. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/cv-generator")}
              className="text-gray-500 hover:text-gray-900 -ml-4 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
            </Button>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Buat CV Baru
                </h1>
                <p className="text-sm text-gray-500">
                  Isi data atau gunakan data dari profil, lalu preview dan
                  download CV kamu.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="gap-2"
                >
                  {showPreview ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {showPreview ? "Sembunyikan Preview" : "Tampilkan Preview"}
                </Button>
              </div>
            </div>
          </div>

          {/* Toggle Use Profile Data */}
          <Card className="p-4 mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Gunakan Data Profil
                  </h3>
                  <p className="text-sm text-gray-600">
                    {hasProfileData
                      ? "Otomatis isi form dengan data dari profil kamu."
                      : "Kamu belum memiliki data profil. Silakan isi manual."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={useProfileData}
                  onCheckedChange={handleToggleProfileData}
                  disabled={!hasProfileData}
                />
                <span className="text-sm font-medium text-gray-700">
                  {useProfileData ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
          </Card>

          {/* Messages */}
          {message && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-800 border border-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT: Form */}
            <div className={`${showPreview ? "lg:w-1/2" : "w-full"}`}>
              <form
                onSubmit={handleSubmit(handleSaveAndPreview)}
                className="space-y-6"
              >
                {/* 1. INFORMASI DASAR */}
                <Card className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-hidden">
                  <div className="p-5 space-y-5">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                      <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <h2 className="text-base font-bold text-gray-900">
                        Informasi Dasar
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nama Lengkap"
                        placeholder="Budi Santoso"
                        error={errors.fullName?.message}
                        {...register("fullName", { required: "Wajib diisi" })}
                        className="bg-gray-50"
                      />
                      <Input
                        label="Title / Posisi"
                        placeholder="Full Stack Developer"
                        {...register("title")}
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        type="email"
                        {...register("email", { required: "Wajib diisi" })}
                        className="bg-gray-50"
                      />
                      <Input
                        label="No. Telepon"
                        {...register("phone")}
                        className="bg-gray-50"
                      />
                    </div>
                    <Input
                      label="Lokasi"
                      placeholder="Jakarta, Indonesia"
                      {...register("location")}
                      className="bg-gray-50"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="LinkedIn"
                        placeholder="linkedin.com/in/..."
                        {...register("linkedIn")}
                        className="bg-gray-50"
                      />
                      <Input
                        label="Github"
                        placeholder="github.com/..."
                        {...register("github")}
                        className="bg-gray-50"
                      />
                      <Input
                        label="Portfolio"
                        placeholder="yourwebsite.com"
                        {...register("portfolio")}
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </Card>

                {/* 2. PROFESSIONAL SUMMARY */}
                <Card className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-hidden">
                  <div className="p-5 space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <h2 className="text-base font-bold text-gray-900">
                          Professional Summary
                        </h2>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateAISummary}
                        disabled={isGeneratingAI}
                        className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        {isGeneratingAI ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />{" "}
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3 h-3" /> Generate AI Summary
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      label="Tentang Saya (Manual)"
                      rows={3}
                      placeholder="Tuliskan ringkasan profil profesional kamu..."
                      {...register("summary")}
                      className="bg-gray-50"
                    />
                    <Textarea
                      label="AI Summary (Generated)"
                      rows={4}
                      placeholder="Klik 'Generate AI Summary' untuk membuat ringkasan dengan AI..."
                      {...register("aiSummary")}
                      className="bg-purple-50 border-purple-200"
                    />
                  </div>
                </Card>

                {/* 3. EXPERIENCE */}
                <Card className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-hidden">
                  <div className="p-5 space-y-5">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <h2 className="text-base font-bold text-gray-900">
                          Pengalaman Kerja
                        </h2>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendExperience({
                            company: "",
                            position: "",
                            startDate: "",
                            endDate: "",
                            isCurrent: false,
                            description: [""],
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" /> Tambah
                      </Button>
                    </div>
                    {experienceFields.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Belum ada pengalaman. Klik "Tambah" untuk menambahkan.
                      </p>
                    )}
                    {experienceFields.map((field: any, index: number) => (
                      <div
                        key={field.id}
                        className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-4"
                      >
                        <div className="flex justify-between">
                          <Badge variant="outline" className="bg-white">
                            #{index + 1}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeExperience(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            label="Perusahaan"
                            {...register(
                              `experience.${index}.company` as const,
                            )}
                            className="bg-white"
                          />
                          <Input
                            label="Posisi"
                            {...register(
                              `experience.${index}.position` as const,
                            )}
                            className="bg-white"
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            label="Mulai"
                            type="month"
                            {...register(
                              `experience.${index}.startDate` as const,
                            )}
                            className="bg-white"
                          />
                          <Input
                            label="Selesai"
                            type="month"
                            {...register(
                              `experience.${index}.endDate` as const,
                            )}
                            className="bg-white"
                          />
                        </div>
                        <Controller
                          name={`experience.${index}.description`}
                          control={control}
                          render={({ field }) => (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Deskripsi Pekerjaan
                              </label>
                              {(field.value || [""]).map(
                                (desc: string, i: number) => (
                                  <div key={i} className="flex gap-2">
                                    <Input
                                      value={desc}
                                      placeholder="Tuliskan pencapaian atau tanggung jawab..."
                                      onChange={(e) => {
                                        const n = [...(field.value || [])];
                                        n[i] = e.target.value;
                                        field.onChange(n);
                                      }}
                                      className="bg-white"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const n = field.value?.filter(
                                          (_, idx) => idx !== i,
                                        );
                                        field.onChange(n);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3 text-red-400" />
                                    </Button>
                                  </div>
                                ),
                              )}
                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                onClick={() =>
                                  field.onChange([...(field.value || []), ""])
                                }
                                className="text-xs"
                              >
                                + Tambah Poin
                              </Button>
                            </div>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 4. EDUCATION */}
                <Card className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-hidden">
                  <div className="p-5 space-y-5">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        <h2 className="text-base font-bold text-gray-900">
                          Pendidikan
                        </h2>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendEducation({
                            institution: "",
                            degree: "",
                            fieldOfStudy: "",
                            startDate: "",
                            endDate: "",
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" /> Tambah
                      </Button>
                    </div>
                    {educationFields.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Belum ada pendidikan. Klik "Tambah" untuk menambahkan.
                      </p>
                    )}
                    {educationFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-4"
                      >
                        <div className="flex justify-between">
                          <Badge variant="outline" className="bg-white">
                            #{index + 1}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEducation(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <Input
                          label="Institusi"
                          {...register(
                            `education.${index}.institution` as const,
                          )}
                          className="bg-white"
                        />
                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            label="Gelar"
                            placeholder="S1, D3, SMA..."
                            {...register(`education.${index}.degree` as const)}
                            className="bg-white"
                          />
                          <Input
                            label="Jurusan"
                            {...register(
                              `education.${index}.fieldOfStudy` as const,
                            )}
                            className="bg-white"
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            label="Mulai"
                            type="month"
                            {...register(
                              `education.${index}.startDate` as const,
                            )}
                            className="bg-white"
                          />
                          <Input
                            label="Selesai"
                            type="month"
                            {...register(`education.${index}.endDate` as const)}
                            className="bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 5. SKILLS - 3 Sections */}
                <Card className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-hidden">
                  <div className="p-5 space-y-5">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                      <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <Wrench className="h-4 w-4" />
                      </div>
                      <h2 className="text-base font-bold text-gray-900">
                        Skills
                      </h2>
                    </div>

                    {/* Hard Skills */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-blue-600" />
                          <h3 className="text-sm font-semibold text-gray-800">
                            Hard Skills
                          </h3>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSkill("hardSkill")}
                          className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Tambah
                        </Button>
                      </div>
                      {getSkillsByCategory("hardSkill").length === 0 ? (
                        <p className="text-xs text-gray-400 italic">
                          Contoh: React, Python, Data Analysis, UI/UX Design
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {getSkillsByCategory("hardSkill").map((skill) => (
                            <div
                              key={skill.originalIndex}
                              className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full pl-3 pr-1 py-1"
                            >
                              <input
                                placeholder="Hard skill..."
                                {...register(
                                  `skills.${skill.originalIndex}.name` as const,
                                )}
                                className="border-0 bg-transparent h-6 min-w-[60px] max-w-[180px] text-sm outline-none text-blue-800 placeholder:text-blue-400"
                                style={{
                                  width: `${Math.max(60, (watch(`skills.${skill.originalIndex}.name`) || "").length * 8 + 20)}px`,
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full hover:bg-red-100"
                                onClick={() =>
                                  removeSkillByIndex(skill.originalIndex)
                                }
                              >
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Soft Skills */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-pink-600" />
                          <h3 className="text-sm font-semibold text-gray-800">
                            Soft Skills
                          </h3>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSkill("softSkill")}
                          className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Tambah
                        </Button>
                      </div>
                      {getSkillsByCategory("softSkill").length === 0 ? (
                        <p className="text-xs text-gray-400 italic">
                          Contoh: Communication, Problem Solving, Leadership,
                          Teamwork
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {getSkillsByCategory("softSkill").map((skill) => (
                            <div
                              key={skill.originalIndex}
                              className="inline-flex items-center gap-1 bg-pink-50 border border-pink-200 rounded-full pl-3 pr-1 py-1"
                            >
                              <input
                                placeholder="Soft skill..."
                                {...register(
                                  `skills.${skill.originalIndex}.name` as const,
                                )}
                                className="border-0 bg-transparent h-6 min-w-[60px] max-w-[180px] text-sm outline-none text-pink-800 placeholder:text-pink-400"
                                style={{
                                  width: `${Math.max(60, (watch(`skills.${skill.originalIndex}.name`) || "").length * 8 + 20)}px`,
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full hover:bg-red-100"
                                onClick={() =>
                                  removeSkillByIndex(skill.originalIndex)
                                }
                              >
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tools */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Laptop className="h-4 w-4 text-emerald-600" />
                          <h3 className="text-sm font-semibold text-gray-800">
                            Tools
                          </h3>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSkill("tool")}
                          className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Tambah
                        </Button>
                      </div>
                      {getSkillsByCategory("tool").length === 0 ? (
                        <p className="text-xs text-gray-400 italic">
                          Contoh: Figma, Git, VS Code, Jira, Trello
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {getSkillsByCategory("tool").map((skill) => (
                            <div
                              key={skill.originalIndex}
                              className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full pl-3 pr-1 py-1"
                            >
                              <input
                                placeholder="Tool..."
                                {...register(
                                  `skills.${skill.originalIndex}.name` as const,
                                )}
                                className="border-0 bg-transparent h-6 min-w-[60px] max-w-[180px] text-sm outline-none text-emerald-800 placeholder:text-emerald-400"
                                style={{
                                  width: `${Math.max(60, (watch(`skills.${skill.originalIndex}.name`) || "").length * 8 + 20)}px`,
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full hover:bg-red-100"
                                onClick={() =>
                                  removeSkillByIndex(skill.originalIndex)
                                }
                              >
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* SUBMIT BUTTON */}
                <div className="flex gap-3 pt-2 pb-6">
                  <Button
                    type="submit"
                    disabled={isSavingProfile || isLoading}
                    className="flex-1 bg-black hover:bg-gray-800 text-white h-12 font-semibold shadow-md"
                  >
                    {isSavingProfile || isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isSavingProfile ? "Menyimpan..." : "Memuat Preview..."}
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Simpan & Preview CV
                      </>
                    )}
                  </Button>
                  <Button
                    variant={"outline"}
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading || !htmlContent}
                    className=" hover:bg-gray-100 text-black border border-gray-300 h-12 font-semibold gap-2 px-6"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Mengunduh...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* RIGHT: Preview */}
            {showPreview && (
              <div className="lg:w-1/2">
                <div className="lg:sticky lg:top-20">
                  <Card className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-hidden">
                    <div className="bg-emerald-600 text-white text-xs py-2 px-4 font-medium flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Eye className="w-3 h-3" /> LIVE PREVIEW
                      </span>
                      <span className="text-emerald-200">
                        Format: A4 Modern
                      </span>
                    </div>

                    <div className="p-4 max-h-[70vh] overflow-y-auto">
                      {/* Loading State */}
                      {isLoading && (
                        <div className="min-h-[400px] flex flex-col items-center justify-center">
                          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
                          <p className="text-gray-500 font-medium">
                            Menyiapkan preview...
                          </p>
                        </div>
                      )}

                      {/* Error State */}
                      {error && !isLoading && (
                        <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                          <FileText className="w-12 h-12 text-red-300 mb-3" />
                          <h3 className="font-bold text-red-800">
                            Gagal Memuat Preview
                          </h3>
                          <p className="text-red-600 text-sm mb-4">{error}</p>
                          <Button variant="outline" onClick={loadPreview}>
                            Coba Lagi
                          </Button>
                        </div>
                      )}

                      {/* Empty State */}
                      {!htmlContent && !isLoading && !error && (
                        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-300 rounded-lg">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-gray-300" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Belum ada Preview
                          </h3>
                          <p className="text-gray-500 max-w-xs mx-auto mb-4 text-sm">
                            Isi form di sebelah kiri lalu klik "Simpan & Preview
                            CV" untuk melihat hasil.
                          </p>
                        </div>
                      )}

                      {/* Actual Preview - Using iframe to isolate CSS */}
                      {htmlContent && !isLoading && !error && (
                        <div className="cv-preview-wrapper">
                          <iframe
                            title="CV Preview"
                            srcDoc={htmlContent}
                            className="w-full border border-gray-200 shadow-sm rounded-lg bg-white"
                            style={{
                              minHeight: "700px",
                              height: "100%",
                            }}
                            sandbox="allow-same-origin"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
