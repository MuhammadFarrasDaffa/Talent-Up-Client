"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { jobService } from "@/services/jobService";
import { useRouter } from "next/navigation";
import TextType from "@/components/ui/TextType";
import DotGrid from "@/components/ui/DotGrid";
import ScrollFloat from "@/components/ui/ScrollFloat";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary?: { min: number; max: number; currency: string };
  type: string;
  skills: string[];
}
// Tipe data Job (sesuaikan dengan backend kamu)

// export default function DashboardPage() {
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   const router = useRouter();

//   // Fetch Data saat halaman dimuat
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     setIsLoggedIn(!!token); // true jika token ada

//     const fetchJobs = async () => {
//       const result = await jobService.getAllJobs();
//       // Asumsikan struktur response backend: { success: true, data: [...] }
//       setJobs(result.data || []);
//       setLoading(false);
//     };
//     fetchJobs();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50/50">
//       <Navbar />

//       {/* --- HERO SECTION --- */}
//       <div className="relative pt-32 pb-20 px-4 overflow-hidden">
//         {/* Background Animation (Masked agar memudar ke bawah) */}
//         <div className="absolute inset-0 z-0 h-[500px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]">
//           <PixelBlast
//             variant="square"
//             pixelSize={4}
//             color="#7588d7" // Warna Pixel Biru Ungu
//             patternScale={2}
//             patternDensity={1}
//             pixelSizeJitter={0}
//             enableRipples
//             rippleSpeed={0.4}
//             rippleThickness={0.12}
//             rippleIntensityScale={1.5}
//             liquid={false}
//             speed={0.5}
//             edgeFade={0.25}
//             transparent={true}
//           />
//         </div>

//         <div className="container mx-auto relative z-10 text-center max-w-3xl">
//           <Badge
//             variant="secondary"
//             className="mb-4 px-4 py-1 text-sm bg-white/80 backdrop-blur border border-gray-200 text-blue-600 shadow-sm"
//           >
//             🚀 Platform Karir #1 Berbasis AI
//           </Badge>

//           <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">
//             Temukan Karir Impian <br />
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
//               Tanpa Batas.
//             </span>
//           </h1>

//           <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
//             Talentix menggunakan AI canggih untuk mencocokkan CV-mu dengan
//             ribuan lowongan kerja secara akurat.
//           </p>

//           {/* Search Bar */}
//           <div className="bg-white p-2 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
//               <Input
//                 placeholder="Posisi, skill, atau perusahaan..."
//                 className="pl-10 border-none shadow-none text-base h-12 focus-visible:ring-0"
//               />
//             </div>
//             <div className="w-px bg-gray-200 hidden md:block"></div>
//             <div className="flex-1 relative">
//               <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
//               <Input
//                 placeholder="Lokasi (e.g. Jakarta)"
//                 className="pl-10 border-none shadow-none text-base h-12 focus-visible:ring-0"
//               />
//             </div>
//             <Button
//               size="lg"
//               className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
//             >
//               Cari
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* --- STATS SECTION --- */}
//       <div className="container mx-auto px-4 -mt-10 relative z-20 mb-16">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Stat 1 */}
//           <Card className="border-none shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur">
//             <CardContent className="p-6 flex items-center gap-4">
//               <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
//                 <Briefcase className="h-6 w-6" />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500 font-medium">
//                   Total Lowongan
//                 </p>
//                 <h3 className="text-2xl font-bold text-gray-900">1,240+</h3>
//               </div>
//             </CardContent>
//           </Card>
//           {/* Stat 2 */}
//           <Card className="border-none shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur">
//             <CardContent className="p-6 flex items-center gap-4">
//               <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
//                 <UserIcon className="h-6 w-6" />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500 font-medium">
//                   Kandidat Aktif
//                 </p>
//                 <h3 className="text-2xl font-bold text-gray-900">850+</h3>
//               </div>
//             </CardContent>
//           </Card>
//           {/* Stat 3 */}
//           <Card className="border-none shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur">
//             <CardContent className="p-6 flex items-center gap-4">
//               <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
//                 <CheckIcon className="h-6 w-6" />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500 font-medium">
//                   Success Hire
//                 </p>
//                 <h3 className="text-2xl font-bold text-gray-900">320+</h3>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* --- REKOMENDASI PEKERJAAN --- */}
//       <div className="container mx-auto px-4 pb-20">
//         <div className="flex justify-between items-end mb-8">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">
//               Rekomendasi Terbaru
//             </h2>
//             <p className="text-gray-500 mt-1">
//               Pekerjaan yang mungkin cocok dengan profilmu.
//             </p>
//           </div>
//           <Link href="/jobs">
//             <Button
//               variant="ghost"
//               className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
//             >
//               Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
//             </Button>
//           </Link>
//         </div>

//         {/* JOB GRID */}
//         {loading ? (
//           <div className="text-center py-20 text-gray-400">
//             Sedang memuat lowongan...
//           </div>
//         ) : jobs.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {jobs.map((job) => (
//               <Card key={job._id} className="...">
//                 <CardContent className="p-6">
//                   {/* ... (Konten Job Card sama) ... */}

//                   <div className="flex items-center justify-between pt-4 border-t border-gray-100">
//                     <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
//                       <DollarSign className="h-4 w-4 text-gray-400" />
//                       IDR 8jt - 15jt
//                     </div>

//                     {/* LOGIC TOMBOL APPLY */}
//                     {isLoggedIn ? (
//                       // JIKA LOGIN: Tombol Apply Aktif
//                       <Link href={`/jobs/${job._id}`}>
//                         <Button
//                           size="sm"
//                           className="bg-black hover:bg-gray-800 text-white rounded-lg"
//                         >
//                           Apply
//                         </Button>
//                       </Link>
//                     ) : (
//                       // JIKA BELUM LOGIN: Tombol Login to Apply
//                       <Link href="/login">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="text-blue-600 border-blue-200 hover:bg-blue-50"
//                         >
//                           Login to Apply
//                         </Button>
//                       </Link>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         ) : (
//           // Empty State
//           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
//             <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
//             <p className="text-gray-500">
//               Belum ada lowongan tersedia saat ini.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// Komponen ikon kecil tambahan biar tidak error
// ... (Interface Job tetap sama)

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    const fetchJobs = async () => {
      const result = await jobService.getAllJobs();
      setJobs(result.data || []);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Navbar />

      {/* --- HERO SECTION WITH DOTGRID BACKGROUND --- */}
      <section className="relative min-h-[90vh] overflow-hidden">
        {/* Background DotGrid - seperti di AI Interview */}
        <div className="absolute inset-0 w-full h-full z-0">
          <DotGrid
            dotSize={5}
            gap={15}
            baseColor="#fafaff"
            activeColor="#5227FF"
            proximity={170}
            speedTrigger={100}
            shockRadius={250}
            shockStrength={5}
            maxSpeed={5000}
            resistance={750}
            returnDuration={1.5}
          />
        </div>

        {/* Hero Content (Overlay) */}
        <div className="relative pt-32 pb-24 md:pt-40 md:pb-32 container mx-auto px-4 z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Platform Karir Berbasis AI #1 di Indonesia</span>
            </div>

            {/* Headline dengan TextType Animation - mirip Antigravity */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-slate-900 tracking-tight mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Temukan Karir Impian{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 animate-gradient">
                <TextType
                  texts={[
                    "Tanpa Batas.",
                    "Dengan AI.",
                    "Lebih Cepat.",
                    "Bersama Seekers.",
                  ]}
                  speed={100}
                  deleteSpeed={60}
                  waitTime={2500}
                  loop={false}
                  cursorChar="|"
                />
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Seekers menggunakan teknologi AI untuk mencocokkan profilmu dengan
              ribuan peluang kerja secara instan dan akurat.
            </p>

            {/* Search Bar Container (Floating Card Style) */}
            <div className="bg-white p-3 rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-3 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              {/* Input 1: Keyword */}
              <div className="flex-1 relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Search className="h-5 w-5" />
                </div>
                <Input
                  placeholder="Posisi, skill, atau perusahaan..."
                  className="pl-12 border-0 shadow-none text-base h-12 bg-slate-50/50 focus:bg-white rounded-xl focus-visible:ring-0 placeholder:text-slate-400 text-slate-900"
                />
              </div>

              <div className="w-px bg-slate-200 hidden md:block my-2"></div>

              {/* Input 2: Location */}
              <div className="flex-1 relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <MapPin className="h-5 w-5" />
                </div>
                <Input
                  placeholder="Lokasi (e.g. Jakarta)"
                  className="pl-12 border-0 shadow-none text-base h-12 bg-slate-50/50 focus:bg-white rounded-xl focus-visible:ring-0 placeholder:text-slate-400 text-slate-900"
                />
              </div>

              {/* Search Button */}
              <Button
                size="lg"
                className="h-12 px-8 bg-black hover:bg-slate-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Cari Lowongan
              </Button>
            </div>

            {/* Stats / Trust - sama seperti AI Interview */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap justify-center gap-8 md:gap-16 text-slate-400 animate-in fade-in duration-1000 delay-500 opacity-0 fill-mode-forwards">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">
                  1,200+ Lowongan Baru
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">850+ Kandidat Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                <span className="text-sm font-medium">AI-Powered Matching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION WITH SCROLL FLOAT --- */}
      <div className="bg-white py-32 relative z-10 border-t border-zinc-100">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Label & Text */}
            <div className="space-y-8">
              {/* Label Kecil */}
              <div>
                <span className="px-4 py-1.5 rounded-full border border-zinc-200 text-[10px] font-bold tracking-widest uppercase text-zinc-400 bg-zinc-50/50">
                  Tentang Seekers
                </span>
              </div>

              {/* ScrollFloat Animation */}
              <ScrollFloat
                containerClassName=""
                textClassName="text-3xl md:text-4xl lg:text-5xl font-normal text-zinc-600 leading-tight"
                animationDuration={1}
                ease="back.inOut(1.5)"
                scrollStart="top bottom"
                scrollEnd="bottom center"
                stagger={0.015}
              >
                Platform karir berbasis AI yang menghubungkan talenta terbaik
                dengan peluang global. Tanpa bias, tanpa batas.
              </ScrollFloat>
            </div>

            {/* Right Column - Stats Grid */}
            <div className="grid grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-zinc-50/50 border border-zinc-100 group transition-all duration-500 hover:scale-105 hover:bg-blue-50 hover:border-blue-100">
                <h4 className="text-4xl font-bold text-zinc-900 mb-2 group-hover:text-blue-600 transition-colors">
                  10k+
                </h4>
                <p className="text-sm text-zinc-500">Pengguna Aktif</p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-50/50 border border-zinc-100 group transition-all duration-500 hover:scale-105 hover:bg-indigo-50 hover:border-indigo-100">
                <h4 className="text-4xl font-bold text-zinc-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  95%
                </h4>
                <p className="text-sm text-zinc-500">Match Accuracy</p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-50/50 border border-zinc-100 group transition-all duration-500 hover:scale-105 hover:bg-violet-50 hover:border-violet-100">
                <h4 className="text-4xl font-bold text-zinc-900 mb-2 group-hover:text-violet-600 transition-colors">
                  500+
                </h4>
                <p className="text-sm text-zinc-500">Perusahaan Mitra</p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-50/50 border border-zinc-100 group transition-all duration-500 hover:scale-105 hover:bg-emerald-50 hover:border-emerald-100">
                <h4 className="text-4xl font-bold text-zinc-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  24/7
                </h4>
                <p className="text-sm text-zinc-500">AI Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION LAIN (STATS, JOBS, DLL) --- */}
      <div className="container mx-auto px-4 pb-20">
        {/* ... Render Stats Card & Job Grid di sini ... */}
      </div>
    </div>
  );
}

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
