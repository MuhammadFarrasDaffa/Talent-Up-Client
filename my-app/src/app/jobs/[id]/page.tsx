"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Share2,
  Bookmark,
  ShieldCheck,
  Heart,
  ChevronLeft,
  ArrowUpRight,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { jobService } from "@/services/jobService";
import { Job } from "@/types";
import { formatCurrency, timeAgo } from "@/lib/utils";
import JobAIAnalysis from "@/components/jobs/JobAIAnalysis";
import SimilarJobsWidget from "@/components/jobs/SimilarJobsWidget";

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      if (!id) return;
      try {
        setLoading(true);
        const data = await jobService.getJobById(id);
        setJob(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params.id]);

  if (loading) return <DetailSkeleton />;
  if (!job)
    return (
      <div className="pt-32 text-center font-semibold text-gray-500">
        Lowongan Tidak Ditemukan
      </div>
    );

  const getSalary = () => {
    if (typeof job.salary === "object" && job.salary.min)
      return `${formatCurrency(job.salary.min)} - ${formatCurrency(job.salary.max)}`;
    if (
      typeof job.salary === "string" &&
      !job.salary.toLowerCase().includes("confidential")
    )
      return job.salary.split("\n").find((l) => l.match(/\d/)) || job.salary;
    return "Gaji Dirahasiakan";
  };

  const jobDate = job.lastUpdated
    ? job.lastUpdated.replace("Diperbarui", "").trim()
    : timeAgo(job.createdAt);

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Navbar />

      {/* --- HEADER SECTION --- */}
      {/* UPDATE 1: Menghapus 'sticky top-0 z-10' agar header ikut scroll */}
      <div className="bg-white border-b border-gray-200 pt-24 pb-8 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/jobs"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Kembali ke Lowongan
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="w-20 h-20 bg-white border border-gray-100 rounded-xl flex items-center justify-center p-2 shadow-sm shrink-0 relative overflow-hidden">
              {job.companyLogo ? (
                <Image
                  src={job.companyLogo}
                  alt={job.company}
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <Building2 className="w-8 h-8 text-gray-300" />
              )}
            </div>

            {/* Main Info */}
            <div className="flex-grow w-full">
              <div className="flex justify-between items-start w-full">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-3 text-lg text-gray-700 font-medium mb-4">
                    {job.company}
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 border-blue-100 text-[10px]"
                    >
                      Verified
                    </Badge>
                  </div>
                </div>
                {/* Action Icons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full hover:text-pink-500 hover:bg-pink-50"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Meta Info Grid */}
              <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" /> {job.jobType}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" /> {job.location}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-gray-900">
                    {getSalary()}
                  </span>
                </div>
                <div className="text-gray-400 text-xs flex items-center mt-0.5">
                  • {jobDate}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3">
                {/* UPDATE 2: Bungkus Button dengan Link ke jobUrl */}
                <Link
                  href={job.jobUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto"
                >
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-11 font-bold shadow-lg shadow-blue-600/20 w-full md:w-auto">
                    Lamar Sekarang <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="rounded-full h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  <Bookmark className="w-4 h-4 mr-2" /> Simpan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID (2 Columns Layout) --- */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* === LEFT COLUMN (Information) - 8 Cols === */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Deskripsi */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>{" "}
                Deskripsi Pekerjaan
              </h3>

              {/* TAMBAHKAN CLASS: 'job-description-content' */}
              <div
                className="job-description-content prose prose-sm prose-slate max-w-none text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: job.description || "" }}
              />
            </div>

            {/* 2. Skills */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-600 rounded-full"></div>{" "}
                Kualifikasi
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 text-sm font-medium border border-slate-200"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 3. Safety Tips */}
            <div className="bg-orange-50 rounded-xl p-5 border border-orange-100 flex gap-4 items-start">
              <div className="bg-orange-100 p-2 rounded-lg shrink-0">
                <ShieldCheck className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-bold text-orange-900 text-sm mb-1">
                  Tips Keamanan
                </h4>
                <p className="text-xs text-orange-800 leading-relaxed">
                  Seekers tidak pernah meminta pembayaran apapun dari pelamar.
                  Hati-hati terhadap penipuan lowongan kerja.
                </p>
              </div>
            </div>

            {/* 4. Tentang Perusahaan */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Tentang {job.company}
                </h3>

                {/* UPDATE DISINI: Link Website */}
                {job.companyDetails?.website && (
                  <Link
                    href={job.companyDetails.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    Kunjungi Website <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {job.companyDetails?.description ||
                  `${job.company} adalah perusahaan terkemuka yang bergerak di bidang teknologi. Kami berkomitmen untuk menciptakan inovasi digital yang berdampak positif.`}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 block mb-1">
                    Industri
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {job.companyDetails?.industry || "Teknologi & Informasi"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block mb-1">
                    Ukuran Perusahaan
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {job.companyDetails?.size || "50 - 200 Karyawan"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* === RIGHT COLUMN (Sidebar - 4 Cols) === */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* WIDGET 1: AI MATCH */}
            <div className="relative z-10">
              <JobAIAnalysis jobId={job._id} />
            </div>

            {/* WIDGET 2: BENEFITS */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                Benefit & Fasilitas
              </h4>

              {/* STYLE BARU: GRID & EYE CATCHING */}
              <div className="grid grid-cols-1 gap-3">
                {(job.benefits && job.benefits.length > 0
                  ? job.benefits
                  : [
                      "BPJS Kesehatan",
                      "Waktu Fleksibel",
                      "Laptop Kantor",
                      "Tunjangan Makan",
                    ]
                ).map((ben: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                      {/* Icon Generator based on text (Simple Logic) */}
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${ben}&backgroundColor=b6e3f4`}
                        alt="icon"
                        className="w-5 h-5 rounded-full opacity-80"
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">
                      {ben}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET 3: SIMILAR JOBS */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-900 text-sm">
                  Lowongan Serupa
                </h4>
                <Link
                  href="/jobs"
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  Lihat Semua
                </Link>
              </div>
              <SimilarJobsWidget currentJobId={job._id} category={job.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-white pt-24 px-4 container mx-auto max-w-7xl">
      <div className="flex gap-4 mb-8">
        <Skeleton className="w-20 h-20 rounded-xl" />
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-40 rounded-full mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-60 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
