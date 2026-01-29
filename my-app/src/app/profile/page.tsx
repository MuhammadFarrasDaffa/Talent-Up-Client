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
import { paymentService } from "@/services/paymentService";
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
  Trophy,
  Eye,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Calendar,
  Clock,
  AlertCircle,
  BrainCircuit,
} from "lucide-react";
import type { ProfileFormData, Experience, Education } from "@/types/index";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

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
interface Payment {
  _id: string;
  orderId: string;
  packageType: string;
  tokenAmount: number;
  price: number;
  status: string;
  snapToken?: string;
  createdAt: string;
}

declare global {
  interface Window {
    snap: any;
  }
}

const PaymentHistorySection = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    loadPaymentHistory();
    loadMidtransScript();
  }, []);

  const loadMidtransScript = () => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
    );
    document.body.appendChild(script);
  };

  const loadPaymentHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await paymentService.getPaymentHistory(token);
      setPayments(response.data || []);
    } catch (error: any) {
      console.error("Failed to load payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { className: string; label: string; icon?: React.ReactNode }
    > = {
      success: {
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Berhasil",
        icon: <CheckCircle className="w-3.5 h-3.5 mr-1" />,
      },
      pending: {
        className: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Menunggu",
        icon: <Clock className="w-3.5 h-3.5 mr-1" />,
      },
      failed: {
        className: "bg-red-50 text-red-700 border-red-200",
        label: "Gagal",
        icon: <AlertCircle className="w-3.5 h-3.5 mr-1" />,
      },
      expired: {
        className: "bg-gray-100 text-gray-600 border-gray-200",
        label: "Kadaluarsa",
      },
    };

    const config = statusConfig[status] || {
      className: "bg-gray-100 text-gray-600 border-gray-200",
      label: status,
    };

    return (
      <Badge
        className={`${config.className} border px-2.5 py-0.5 text-xs font-medium flex items-center w-fit shadow-sm`}
      >
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleContinuePayment = async (payment: Payment) => {
    if (!payment.snapToken) {
      toast.error("Token pembayaran tidak tersedia");
      return;
    }
    try {
      setProcessingPayment(payment._id);
      if (window.snap) {
        window.snap.pay(payment.snapToken, {
          onSuccess: async function (result: any) {
            toast.success("Pembayaran berhasil!");
            await loadPaymentHistory();
            window.dispatchEvent(new Event("storage"));
          },
          onPending: function (result: any) {
            toast.info("Menunggu pembayaran...");
            loadPaymentHistory();
          },
          onError: function (result: any) {
            toast.error("Pembayaran gagal!");
            loadPaymentHistory();
          },
          onClose: function () {
            setProcessingPayment(null);
          },
        });
      } else {
        toast.error("Payment gateway belum siap. Silakan refresh halaman.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat membuka pembayaran");
      console.error("Error opening payment:", error);
    } finally {
      setTimeout(() => setProcessingPayment(null), 1000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat riwayat transaksi...</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100">
          <Receipt className="h-10 w-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Belum ada Transaksi
        </h3>
        <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
          Riwayat pembelian token atau paket langganan Anda akan muncul di sini.
        </p>
        <Button
          onClick={() => router.push("/payment")}
          className="bg-black text-white hover:bg-gray-800 rounded-xl px-8 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Beli Token Sekarang
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Riwayat Pembelian</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola dan pantau semua transaksi token Anda.
          </p>
        </div>
        <Button
          onClick={() => router.push("/payment")}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-100"
        >
          <Plus className="w-4 h-4 mr-2" />
          Top Up Token
        </Button>
      </div>

      {/* Payment List */}
      <div className="grid gap-4">
        {payments.map((payment) => (
          <div
            key={payment._id}
            className="group relative bg-white border border-gray-200 rounded-2xl p-6 transition-all hover:shadow-lg hover:border-blue-200"
          >
            {/* Top Row: Icon, Title, Status */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg capitalize">
                    {payment.packageType} Package
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-1 bg-gray-50 px-2 py-0.5 rounded w-fit">
                    <span>#{payment.orderId}</span>
                  </div>
                </div>
              </div>
              <div className="self-start md:self-center">
                {getStatusBadge(payment.status)}
              </div>
            </div>

            {/* Middle Row: Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 py-5 border-t border-gray-50">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                  Total Token
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-gray-900">
                    {payment.tokenAmount}{" "}
                    <span className="text-xs font-normal text-gray-500">
                      Tokens
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                  Total Bayar
                </p>
                <p className="font-bold text-gray-900">
                  {formatPrice(payment.price)}
                </p>
              </div>
              <div className="col-span-2 md:col-span-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                  Waktu Transaksi
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(payment.createdAt)}
                </div>
              </div>
            </div>

            {/* Bottom Row: Actions (Only if needed) */}
            {(payment.status === "pending" || payment.status === "expired") && (
              <div className="flex justify-end pt-4 border-t border-gray-100">
                {payment.status === "pending" && payment.snapToken && (
                  <Button
                    variant={"outline"}
                    onClick={() => handleContinuePayment(payment)}
                    disabled={processingPayment === payment._id}
                    className="border-black hover:bg-black hover:text-white text-black rounded-lg h-10 px-6  transition-all"
                  >
                    {processingPayment === payment._id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Memproses...
                      </>
                    ) : (
                      "Bayar Sekarang"
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- PLACEHOLDERS LAINNYA ---
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

// ... imports tetap sama

const HistorySection = () => {
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedInterviews, setExpandedInterviews] = useState<Set<string>>(
    new Set(),
  );
  const router = useRouter();

  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  const fetchInterviewHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/interviews/history", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch interview history");
      const data = await response.json();
      setInterviews(data.interviews);
    } catch (error) {
      console.error("Error fetching interview history:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedInterviews((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // ... helper functions (formatDate, getLevelColor, dll) tetap sama ...
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "junior":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "middle":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "senior":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };
  const getTierColor = (tier: string) => {
    return tier.toLowerCase() === "premium"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-50 text-slate-600 border-slate-200";
  };
  const getGradeBadgeStyle = (grade: string) => {
    if (grade.startsWith("A"))
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (grade.startsWith("B"))
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (grade.startsWith("C"))
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat riwayat interview...</p>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100">
          <History className="h-10 w-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Belum ada Riwayat
        </h3>
        <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
          Lakukan simulasi interview pertamamu dan dapatkan feedback instan dari
          AI.
        </p>
        <Link href="/interview">
          <Button className="bg-black text-white hover:bg-gray-800 rounded-xl px-8 shadow-lg">
            <Plus className="w-4 h-4 mr-2" /> Mulai Interview
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Riwayat Aktivitas
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Pantau perkembangan skor interview kamu.
          </p>
        </div>
        <Link href="/interview/setup">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-100 h-10 px-5">
            <Plus className="w-4 h-4 mr-2" /> Interview Baru
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {interviews.map((interview) => (
          <div
            key={interview._id}
            className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300"
          >
            {/* --- MAIN CARD CONTENT --- */}
            <div className="p-5 sm:p-6">
              <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                {/* LEFT: Info Utama */}
                <div className="flex items-start gap-4 w-full md:w-auto">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600 shadow-sm">
                    <BrainCircuit className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-base md:text-lg group-hover:text-blue-600 transition-colors">
                        {interview.category}
                      </h3>
                      {interview.evaluated && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-medium border border-green-100">
                          <CheckCircle className="w-3 h-3" /> Selesai
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <span className="capitalize font-medium px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                          {interview.level}
                        </span>
                        <span
                          className={`capitalize font-medium px-2 py-0.5 rounded ${interview.tier === "premium" ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-600"}`}
                        >
                          {interview.tier} Plan
                        </span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(interview.completedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Score & Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pl-0 md:pl-6 md:border-l border-gray-100/50">
                  {interview.evaluated && interview.evaluation ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden md:block">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                          Skor
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {interview.evaluation.overallScore}
                          <span className="text-gray-400 font-normal">
                            /100
                          </span>
                        </p>
                      </div>
                      <div
                        className={`h-10 w-10 flex items-center justify-center rounded-lg border text-lg font-bold shadow-sm ${getGradeBadgeStyle(interview.evaluation.overallGrade)}`}
                      >
                        {interview.evaluation.overallGrade}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic py-2">
                      Belum dievaluasi
                    </span>
                  )}

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {interview.evaluated && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/interview/evaluate?id=${interview._id}`)
                        }
                        className="flex-1 md:flex-none h-9 text-xs border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                      >
                        Detail Evaluasi
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleExpand(interview._id)}
                      className={`h-9 w-9 text-gray-400 hover:text-gray-900 transition-transform duration-300 ${expandedInterviews.has(interview._id) ? "rotate-180 bg-gray-100" : ""}`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* --- EXPANDED DETAILS (SCROLLABLE ACCORDION) --- */}
            <div
              className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                // UPDATE 1: Batasi tinggi wrapper animasi agar tidak infinite
                expandedInterviews.has(interview._id)
                  ? "max-h-[600px] border-t border-gray-100"
                  : "max-h-0"
              }`}
            >
              <div className="p-6 bg-gray-50/50">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <h4 className="text-sm font-bold text-gray-900">
                    Transkrip Sesi
                  </h4>
                </div>

                {/* UPDATE 2: Tambahkan Container Scroll disini */}
                {/* max-h-[350px] akan membatasi area scroll */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {interview.answers?.map((answer, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative"
                    >
                      <div className="absolute left-6 top-8 bottom-0 w-px bg-gray-100 -z-10"></div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5">
                          Q{index + 1}
                        </div>
                        <div className="space-y-2 flex-1">
                          <p className="text-gray-900 text-sm font-medium leading-relaxed">
                            {answer.question}
                          </p>

                          <div className="flex gap-3 mt-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                            </div>
                            <div className="space-y-1.5 w-full">
                              <p className="text-sm text-gray-600 leading-relaxed italic bg-gray-50 p-3 rounded-lg rounded-tl-none border border-gray-100">
                                "
                                {answer.transcription || (
                                  <span className="text-gray-400">
                                    Tidak ada suara terdeteksi
                                  </span>
                                )}
                                "
                              </p>

                              <div className="flex items-center justify-between text-[10px] text-gray-400 pl-1">
                                {answer.duration > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />{" "}
                                    {formatDuration(answer.duration)}
                                  </span>
                                )}
                                {answer.acknowledgment && (
                                  <span className="text-blue-400 font-medium">
                                    AI Feedback Received
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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

  // Load user info dari profile saat component mount
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const { profile } = await profileService.getProfile();
        if (profile) {
          setUserInfo({
            name: profile.fullName || "User",
            role: profile.title || "Job Seeker",
          });
        }
      } catch (error) {
        console.error("Failed to load user info:", error);
      }
    };
    loadUserInfo();
  }, []);

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
