"use client";

import { useEffect, useState, useRef } from "react";
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
  Save,
  Loader2,
  Settings,
  Bookmark,
  History,
  Receipt,
  UploadCloud,
  FileText,
} from "lucide-react";
import type { ProfileFormData } from "@/types/index";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// --- COMPONENT: FORM EDIT PROFILE + UPLOAD CV ---
const ProfileEditSection = ({
  onProfileUpdate,
}: {
  onProfileUpdate: (name: string, role: string) => void;
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false); // State untuk loading upload
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({ control, name: "skills" });
  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({ control, name: "certifications" });

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
        console.error(error);
      }
    };
    loadProfile();
  }, [reset]);

  // --- HANDLER UPLOAD CV ---
  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi file type
    if (file.type !== "application/pdf") {
      setMessage("Hanya file PDF yang didukung.");
      return;
    }

    // Validasi file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Ukuran file maksimal 5MB.");
      return;
    }

    try {
      setIsUploadingCV(true);
      setMessage("");

      // Panggil Service Parsing
      const parsedData = await profileService.parseResume(file);

      // Auto-fill Form dengan data hasil parsing
      if (parsedData.fullName) setValue("fullName", parsedData.fullName);
      if (parsedData.email) setValue("email", parsedData.email);
      if (parsedData.phone) setValue("phone", parsedData.phone);
      if (parsedData.title) setValue("title", parsedData.title);
      if (parsedData.summary) setValue("summary", parsedData.summary);
      if (parsedData.location) setValue("location", parsedData.location);

      // Handle experience - ensure proper format
      if (parsedData.experience && parsedData.experience.length > 0) {
        const formattedExperience = parsedData.experience.map((exp: any) => ({
          company: exp.company || "",
          position: exp.position || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || null,
          isCurrent: exp.isCurrent || false,
          description: Array.isArray(exp.description)
            ? exp.description
            : exp.description
              ? [exp.description]
              : [],
        }));
        setValue("experience", formattedExperience);
      }

      // Handle education - ensure proper format
      if (parsedData.education && parsedData.education.length > 0) {
        const formattedEducation = parsedData.education.map((edu: any) => ({
          institution: edu.institution || "",
          degree: edu.degree || "",
          fieldOfStudy: edu.fieldOfStudy || "",
          grade: edu.grade || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
          description: edu.description || "",
        }));
        setValue("education", formattedEducation);
      }

      // Handle skills - mapping string array ke object array { name: string }
      if (parsedData.skills && parsedData.skills.length > 0) {
        const formattedSkills = parsedData.skills.map(
          (s: string | { name: string }) =>
            typeof s === "string" ? { name: s } : s,
        );
        setValue("skills", formattedSkills);
      }

      setMessage("Data berhasil diisi otomatis dari CV!");
    } catch (error: any) {
      console.error(error);
      setMessage(
        error.message || "Gagal memproses CV. Pastikan format PDF valid.",
      );
    } finally {
      setIsUploadingCV(false);
      // Reset input file agar bisa upload file yang sama lagi jika perlu
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      setMessage("");
      await profileService.createOrUpdateProfile(data);
      onProfileUpdate(data.fullName || "User", data.title || "Job Seeker"); // Update sidebar realtime
      setMessage("Profil berhasil disimpan!");
    } catch (error: any) {
      setMessage(error.message || "Gagal menyimpan profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    } catch (error) {
      setMessage("Gagal generate AI summary.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* --- FITUR BARU: AUTO FILL DARI CV --- */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Isi Profil Otomatis</h3>
            <p className="text-blue-100 text-sm">
              Upload CV (PDF) kamu dan biarkan AI mengisi formulir di bawah ini.
            </p>
          </div>
        </div>
        <div>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleCVUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingCV}
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold border-0 shadow-md"
          >
            {isUploadingCV ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 mr-2" /> Upload CV
              </>
            )}
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium ${message.includes("berhasil") ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 1. INFORMASI DASAR */}
        <Card className="border border-gray-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Informasi Dasar
                </h2>
                <p className="text-xs text-gray-500">
                  Data pribadi dan kontak.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                placeholder="Jakarta"
                {...register("location")}
                className="bg-gray-50"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <Input
                  label="LinkedIn"
                  placeholder="linkedin.com/..."
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
                  placeholder="yourweb.com"
                  {...register("portfolio")}
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 2. SUMMARY */}
        <Card className="border border-gray-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Professional Summary
                </h2>
              </div>
            </div>
            <Textarea
              label="Tentang Saya"
              rows={5}
              {...register("summary")}
              className="bg-gray-50 border-gray-200"
            />
          </div>
        </Card>

        {/* 3. EXPERIENCE */}
        <Card className="border border-gray-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Pengalaman</h2>
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
                <Plus className="h-4 w-4 mr-2" /> Tambah
              </Button>
            </div>
            {experienceFields.map((field: any, index: number) => (
              <div
                key={field.id}
                className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4"
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
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Perusahaan"
                    {...register(`experience.${index}.company` as const)}
                    className="bg-white"
                  />
                  <Input
                    label="Posisi"
                    {...register(`experience.${index}.position` as const)}
                    className="bg-white"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Mulai"
                    type="month"
                    {...register(`experience.${index}.startDate` as const)}
                    className="bg-white"
                  />
                  <Input
                    label="Selesai"
                    type="month"
                    {...register(`experience.${index}.endDate` as const)}
                    className="bg-white"
                  />
                </div>
                <Controller
                  name={`experience.${index}.description`}
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      {(field.value || [""]).map((desc: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={desc}
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
                      ))}
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
        <Card className="border border-gray-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Pendidikan</h2>
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
                <Plus className="h-4 w-4 mr-2" /> Tambah
              </Button>
            </div>
            {educationFields.map((field, index) => (
              <div
                key={field.id}
                className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4"
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
                  {...register(`education.${index}.institution` as const)}
                  className="bg-white"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Gelar"
                    {...register(`education.${index}.degree` as const)}
                    className="bg-white"
                  />
                  <Input
                    label="Jurusan"
                    {...register(`education.${index}.fieldOfStudy` as const)}
                    className="bg-white"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Mulai"
                    type="month"
                    {...register(`education.${index}.startDate` as const)}
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

        {/* 5. SKILLS */}
        <Card className="border border-gray-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Wrench className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Skill</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendSkill({ name: "" })}
              >
                <Plus className="h-4 w-4 mr-2" /> Tambah
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {skillFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-1 items-center bg-gray-50 rounded-lg p-1 border border-gray-200"
                >
                  <Input
                    placeholder="Skill..."
                    {...register(`skills.${index}.name` as const)}
                    className="border-0 bg-transparent h-8 text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeSkill(index)}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* BUTTON SAVE */}
        <div className="flex justify-end pt-4 pb-20">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="bg-black text-white hover:bg-gray-800 rounded-xl px-10 shadow-xl"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
};

// --- PLACEHOLDER UNTUK HISTORY PEMBELIAN ---
const PaymentHistorySection = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200">
    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
      <Receipt className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-bold text-gray-900">Belum ada Transaksi</h3>
    <p className="text-gray-500 mt-1 mb-6 text-sm text-center max-w-md">
      Riwayat pembelian token atau langganan kamu akan muncul di sini.
    </p>
    <Button variant="outline">Beli Token</Button>
  </div>
);

// --- PLACEHOLDERS LAINNYA ---
const HistorySection = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200">
    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
      <History className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-bold text-gray-900">
      Belum ada Riwayat Interview
    </h3>
    <Link href="/interview">
      <Button>Mulai Interview</Button>
    </Link>
  </div>
);

const SavedJobsSection = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200">
    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
      <Bookmark className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-bold text-gray-900">
      Belum ada Pekerjaan Disimpan
    </h3>
    <Link href="/jobs">
      <Button variant="outline">Cari Lowongan</Button>
    </Link>
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  // STATE BARU: Untuk menyimpan info user yang login
  const [userInfo, setUserInfo] = useState({
    name: "User",
    role: "Job Seeker",
  });

  // Update info sidebar saat form profile disave atau diload
  const updateSidebarInfo = (name: string, role: string) => {
    setUserInfo({ name: name || "User", role: role || "Job Seeker" });
  };

  // UPDATE MENU ITEMS (Tambah History Pembelian)
  const menuItems = [
    { id: "profile", label: "Informasi Profil", icon: User },
    { id: "saved", label: "Pekerjaan Disimpan", icon: Bookmark, badge: 0 },
    { id: "history", label: "Riwayat AI Interview", icon: History },
    { id: "payment", label: "History Pembelian", icon: Receipt }, // NEW
    { id: "settings", label: "Pengaturan Akun", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* === SIDEBAR === */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm sticky top-24 overflow-hidden">
              {/* Header Sidebar (Dynamic User Name) */}
              <div className="p-6 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm uppercase">
                  {userInfo.name.substring(0, 2)}
                </div>
                <h3 className="font-bold text-gray-900 truncate px-2">
                  {userInfo.name}
                </h3>
                <p className="text-xs text-gray-500 truncate px-2">
                  {userInfo.role}
                </p>
              </div>

              <div className="p-3 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? "bg-black text-white shadow-md" // UPDATE: Warna aktif jadi Hitam
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`w-4 h-4 ${activeTab === item.id ? "text-white" : "text-gray-400"}`}
                      />
                      {item.label}
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === item.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* === CONTENT === */}
          <div className="lg:col-span-9">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {menuItems.find((i) => i.id === activeTab)?.label}
              </h1>
              <p className="text-gray-500 text-sm">
                Kelola informasi dan aktivitasmu di sini.
              </p>
            </div>

            {activeTab === "profile" && (
              <ProfileEditSection onProfileUpdate={updateSidebarInfo} />
            )}
            {activeTab === "saved" && <SavedJobsSection />}
            {activeTab === "history" && <HistorySection />}
            {activeTab === "payment" && <PaymentHistorySection />}
            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-200">
                <Settings className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  Pengaturan akun akan segera hadir.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
