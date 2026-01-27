/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { profileService, aiService } from "@/services/profileService";
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  Sparkles,
  Plus,
  Trash2,
  BookUser,
} from "lucide-react";
import type { ProfileFormData, Experience, Education } from "@/types/index";
import PixelBlast from "@/components/ui/PixelBlast";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset, // <-- Import reset
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
  } = useFieldArray({
    control,
    name: "experience",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: "education",
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: "skills",
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control,
    name: "certifications",
  });

  // Helper function to convert date to YYYY-MM format for month input
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

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { profile } = await profileService.getProfile();
        if (profile) {
          // Convert date fields to YYYY-MM format for month inputs
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
          };
          // Use reset to populate the entire form, including field arrays
          reset(formattedProfile as ProfileFormData);
        }
      } catch (error) {
        // If profile doesn't exist (404), that's okay. The form will be empty.
        // For other errors, show a message.
        const err = error as { status?: number; message?: string };
        if (err.status !== 404) {
          console.error("Error loading profile:", error);
          setMessage("Gagal memuat profil. Silakan coba lagi nanti.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      setMessage("");

      await profileService.createOrUpdateProfile(data);

      setMessage("Profil berhasil disimpan!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      const err = error as Error;
      setMessage(err.message || "Gagal menyimpan profil. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateAISummary = async () => {
    try {
      setIsGeneratingAI(true);
      setMessage("");
      const formData = watch();

      // Ensure skills are in the correct format if they exist
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
    } catch (error) {
      const err = error as Error;
      setMessage(err.message || "Gagal generate AI summary.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50/50">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0 h-[500px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]">
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#a8a29e" // Stone color
            patternScale={2}
            patternDensity={1}
            pixelSizeJitter={0}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid={false}
            speed={0.5}
            edgeFade={0.25}
            transparent={true}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <Badge
              variant="secondary"
              className="mb-4 px-4 py-1 text-sm bg-white/80 backdrop-blur border border-gray-200 text-blue-600 shadow-sm"
            >
              <BookUser className="h-4 w-4 mr-2" />
              CV & Profile Builder
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Lengkapi Profil Profesional Anda
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Data yang Anda masukkan akan digunakan untuk membuat CV, melamar
              pekerjaan, dan mendapatkan rekomendasi berbasis AI.
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-xl ${
                message.includes("berhasil")
                  ? "bg-green-50/80 border border-green-200 text-green-800 backdrop-blur-sm"
                  : "bg-red-50/80 border border-red-200 text-red-800 backdrop-blur-sm"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card className="border-none shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-11 w-11 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Informasi Dasar
                </h2>
              </div>

              <div className="flex flex-wrap gap-3 justify-end mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/interview/history")}
                  className="bg-white/80 backdrop-blur border border-gray-200 shadow-sm hover:bg-gray-50"
                >
                  Interview History
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/payment/history")}
                  className="bg-white/80 backdrop-blur border border-gray-200 shadow-sm hover:bg-gray-50"
                >
                  Payment History
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Nama Lengkap"
                  placeholder="John Doe"
                  error={errors.fullName?.message}
                  {...register("fullName", {
                    required: "Nama lengkap wajib diisi",
                  })}
                />

                <Input
                  label="Title / Job Title"
                  placeholder="e.g., Full Stack Developer"
                  error={errors.title?.message}
                  {...register("title")}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    error={errors.email?.message}
                    {...register("email", {
                      required: "Email wajib diisi",
                    })}
                  />

                  <Input
                    label="No. Telepon"
                    placeholder="+62 812 3456 7890"
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                </div>

                <Input
                  label="Lokasi"
                  placeholder="Jakarta, Indonesia"
                  error={errors.location?.message}
                  {...register("location")}
                />

                <div className="space-y-3 pt-4 border-t">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Social Media (Opsional)
                  </h3>
                  <Input
                    label="LinkedIn"
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    error={errors.linkedIn?.message}
                    {...register("linkedIn")}
                  />
                  <Input
                    label="Github"
                    type="url"
                    placeholder="https://github.com/username"
                    error={errors.github?.message}
                    {...register("github")}
                  />
                  <Input
                    label="Portfolio"
                    type="url"
                    placeholder="https://yourportfolio.com"
                    error={errors.portfolio?.message}
                    {...register("portfolio")}
                  />
                </div>
              </div>
            </Card>

            {/* About Me */}
            <Card className="border-none shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-11 w-11 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">About Me</h2>
              </div>

              <Textarea
                label="Ceritakan tentang diri Anda"
                placeholder="Saya adalah seorang profesional dengan pengalaman..."
                rows={4}
                error={errors.summary?.message}
                {...register("summary")}
              />
            </Card>

            {/* Experience */}
            <Card className="border-none shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
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
                  <Plus className="h-4 w-4" />
                  Tambah
                </Button>
              </div>

              <div className="space-y-6">
                {experienceFields.map((field: any, index: number) => (
                  <div
                    key={field.id}
                    className="p-4 border border-gray-200/80 rounded-xl bg-white/50 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900">
                        Pengalaman #{index + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Perusahaan"
                        placeholder="PT Contoh"
                        {...register(`experience.${index}.company` as const)}
                      />
                      <Input
                        label="Posisi"
                        placeholder="Software Engineer"
                        {...register(`experience.${index}.position` as const)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Tanggal Mulai"
                        type="month"
                        {...register(`experience.${index}.startDate` as const)}
                      />
                      <Input
                        label="Tanggal Selesai"
                        type="month"
                        placeholder="Kosongkan jika masih bekerja"
                        {...register(`experience.${index}.endDate` as const)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi Pekerjaan (poin per poin)
                      </label>
                      <Controller
                        name={`experience.${index}.description`}
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            {(field.value || [""]).map(
                              (desc: string, descIndex: number) => (
                                <div
                                  key={descIndex}
                                  className="flex gap-2 items-center"
                                >
                                  <Input
                                    type="text"
                                    value={desc}
                                    onChange={(e) => {
                                      const newDescriptions = [
                                        ...(field.value || [""]),
                                      ];
                                      newDescriptions[descIndex] =
                                        e.target.value;
                                      field.onChange(newDescriptions);
                                    }}
                                    placeholder={`Poin ${descIndex + 1}`}
                                    className="flex-1"
                                  />
                                  {(field.value || [""]).length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => {
                                        const newDescriptions =
                                          field.value?.filter(
                                            (_, i) => i !== descIndex,
                                          ) || [];
                                        field.onChange(newDescriptions);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  )}
                                </div>
                              ),
                            )}
                            <Button
                              type="button"
                              onClick={() => {
                                field.onChange([...(field.value || [""]), ""]);
                              }}
                              variant="link"
                              size="sm"
                              className="p-0 h-auto"
                            >
                              + Tambah poin deskripsi
                            </Button>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                ))}

                {experienceFields.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Belum ada pengalaman kerja.
                  </p>
                )}
              </div>
            </Card>

            {/* Education */}
            <Card className="border-none shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
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
                  <Plus className="h-4 w-4" />
                  Tambah
                </Button>
              </div>

              <div className="space-y-6">
                {educationFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border border-gray-200/80 rounded-xl bg-white/50 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900">
                        Pendidikan #{index + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeEducation(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>

                    <Input
                      label="Institusi"
                      placeholder="Universitas Indonesia"
                      {...register(`education.${index}.institution` as const)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Gelar"
                        placeholder="S1"
                        {...register(`education.${index}.degree` as const)}
                      />
                      <Input
                        label="Jurusan"
                        placeholder="Teknik Informatika"
                        {...register(
                          `education.${index}.fieldOfStudy` as const,
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Tanggal Mulai"
                        type="month"
                        {...register(`education.${index}.startDate` as const)}
                      />
                      <Input
                        label="Tanggal Selesai"
                        type="month"
                        {...register(`education.${index}.endDate` as const)}
                      />
                    </div>

                    <Input
                      label="IPK (Opsional)"
                      placeholder="3.50"
                      {...register(`education.${index}.grade` as const)}
                    />
                  </div>
                ))}

                {educationFields.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Belum ada pendidikan.
                  </p>
                )}
              </div>
            </Card>

            {/* Skills */}
            <Card className="border-none shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Keahlian</h2>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendSkill({ name: "" })}
                >
                  <Plus className="h-4 w-4" />
                  Tambah
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {skillFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-2 items-center bg-white/50 rounded-lg p-2 border"
                  >
                    <Input
                      placeholder="JavaScript"
                      {...register(`skills.${index}.name` as const)}
                      className="flex-1 border-none shadow-none focus-visible:ring-0 h-auto p-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeSkill(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              {skillFields.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Belum ada keahlian.
                </p>
              )}
            </Card>

            {/* Certifications */}
            <Card className="border-none shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Sertifikasi
                  </h2>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendCertification({
                      name: "",
                      issuer: "",
                      year: "",
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Tambah
                </Button>
              </div>

              <div className="space-y-6">
                {certificationFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border border-gray-200/80 rounded-xl bg-white/50 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900">
                        Sertifikasi #{index + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeCertification(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>

                    <Input
                      label="Nama Sertifikasi"
                      placeholder="AWS Certified Solutions Architect"
                      {...register(`certifications.${index}.name` as const)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Penerbit"
                        placeholder="Amazon Web Services"
                        {...register(`certifications.${index}.issuer` as const)}
                      />
                      <Input
                        label="Tahun"
                        type="number"
                        placeholder="2023"
                        {...register(`certifications.${index}.year` as const)}
                      />
                    </div>
                  </div>
                ))}

                {certificationFields.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Belum ada sertifikasi.
                  </p>
                )}
              </div>
            </Card>

            {/* AI Summary */}
            <Card className="border-none shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-11 w-11 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">AI Summary</h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Generate ringkasan profesional otomatis menggunakan AI
                  berdasarkan data profil Anda.
                </p>

                <Button
                  type="button"
                  onClick={handleGenerateAISummary}
                  disabled={isGeneratingAI}
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                  {isGeneratingAI ? (
                    "Generating..."
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>

                <Textarea
                  label="AI Generated Summary"
                  rows={6}
                  placeholder="Klik tombol di atas untuk generate summary..."
                  {...register("aiSummary")}
                />
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 mt-10">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push("/dashboard")}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="default"
                size="lg"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Profil"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
