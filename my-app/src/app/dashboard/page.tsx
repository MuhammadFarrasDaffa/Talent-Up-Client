"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  ArrowRight,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { jobService } from "@/services/jobService";
// import GridBackground from "@/components/ui/GridBackground";
import PixelBlast from "@/components/ui/PixelBlast";
import { useRouter } from "next/navigation";

// Tipe data Job (sesuaikan dengan backend kamu)
interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary?: { min: number; max: number; currency: string };
  type: string;
  skills: string[];
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = useRouter();

  // Fetch Data saat halaman dimuat
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // true jika token ada

    const fetchJobs = async () => {
      const result = await jobService.getAllJobs();
      // Asumsikan struktur response backend: { success: true, data: [...] }
      setJobs(result.data || []);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Animation (Masked agar memudar ke bawah) */}
        <div className="absolute inset-0 z-0 h-[500px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]">
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#7588d7" // Warna Pixel Biru Ungu
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

        <div className="container mx-auto relative z-10 text-center max-w-3xl">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-1 text-sm bg-white/80 backdrop-blur border border-gray-200 text-blue-600 shadow-sm"
          >
            🚀 Platform Karir #1 Berbasis AI
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">
            Temukan Karir Impian <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Tanpa Batas.
            </span>
          </h1>

          <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Talentix menggunakan AI canggih untuk mencocokkan CV-mu dengan
            ribuan lowongan kerja secara akurat.
          </p>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Posisi, skill, atau perusahaan..."
                className="pl-10 border-none shadow-none text-base h-12 focus-visible:ring-0"
              />
            </div>
            <div className="w-px bg-gray-200 hidden md:block"></div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Lokasi (e.g. Jakarta)"
                className="pl-10 border-none shadow-none text-base h-12 focus-visible:ring-0"
              />
            </div>
            <Button
              size="lg"
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
            >
              Cari
            </Button>
          </div>
        </div>
      </div>

      {/* --- STATS SECTION --- */}
      <div className="container mx-auto px-4 -mt-10 relative z-20 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat 1 */}
          <Card className="border-none shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Lowongan
                </p>
                <h3 className="text-2xl font-bold text-gray-900">1,240+</h3>
              </div>
            </CardContent>
          </Card>
          {/* Stat 2 */}
          <Card className="border-none shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <UserIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Kandidat Aktif
                </p>
                <h3 className="text-2xl font-bold text-gray-900">850+</h3>
              </div>
            </CardContent>
          </Card>
          {/* Stat 3 */}
          <Card className="border-none shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <CheckIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Success Hire
                </p>
                <h3 className="text-2xl font-bold text-gray-900">320+</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- REKOMENDASI PEKERJAAN --- */}
      <div className="container mx-auto px-4 pb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Rekomendasi Terbaru
            </h2>
            <p className="text-gray-500 mt-1">
              Pekerjaan yang mungkin cocok dengan profilmu.
            </p>
          </div>
          <Link href="/jobs">
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* JOB GRID */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            Sedang memuat lowongan...
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Card key={job._id} className="...">
                <CardContent className="p-6">
                  {/* ... (Konten Job Card sama) ... */}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      IDR 8jt - 15jt
                    </div>

                    {/* LOGIC TOMBOL APPLY */}
                    {isLoggedIn ? (
                      // JIKA LOGIN: Tombol Apply Aktif
                      <Link href={`/jobs/${job._id}`}>
                        <Button
                          size="sm"
                          className="bg-black hover:bg-gray-800 text-white rounded-lg"
                        >
                          Apply
                        </Button>
                      </Link>
                    ) : (
                      // JIKA BELUM LOGIN: Tombol Login to Apply
                      <Link href="/login">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          Login to Apply
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Belum ada lowongan tersedia saat ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Komponen ikon kecil tambahan biar tidak error
function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
