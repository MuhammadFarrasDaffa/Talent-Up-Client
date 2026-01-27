import Link from "next/link";
import Image from "next/image";
import { MapPin, Briefcase, Bookmark, Clock } from "lucide-react";
import { Job } from "@/types";
import { formatCurrency, timeAgo } from "@/lib/utils";

export default function MiniJobCard({ job }: { job: Job }) {
  // 1. Helper Gaji Pintar (Sama seperti JobCard utama)
  const getFormattedSalary = (salary: Job["salary"]) => {
    if (!salary) return "Confidential";
    if (typeof salary === "object" && "min" in salary) {
      if (salary.min === 0) return "Confidential";
      return `${formatCurrency(salary.min)} - ${formatCurrency(salary.max)}`;
    }
    if (typeof salary === "string") {
      if (salary.toLowerCase().includes("confidential")) return "Confidential";
      // Ambil baris yang mengandung angka/"Rp"
      const lines = salary.split("\n");
      const salaryLine = lines.find(
        (line) => line.includes("Rp") || line.match(/\d/),
      );
      return salaryLine ? salaryLine.trim() : "Confidential";
    }
    return "Confidential";
  };

  // 2. Helper Tanggal (Last Updated)
  const getJobDate = () => {
    if (job.lastUpdated) {
      return job.lastUpdated.replace("Diperbarui", "").trim();
    }
    if (job.createdAt) {
      return timeAgo(job.createdAt);
    }
    return "Baru saja";
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all group relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center relative overflow-hidden">
            {job.companyLogo ? (
              <Image
                src={job.companyLogo}
                alt={job.company}
                fill
                className="object-contain p-1"
              />
            ) : (
              <span className="text-xs font-bold text-gray-400">
                {job.company.substring(0, 2)}
              </span>
            )}
          </div>
          <div className="max-w-[160px]">
            <h4
              className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors"
              title={job.title}
            >
              {job.title}
            </h4>
            <p
              className="text-xs text-gray-500 line-clamp-1"
              title={job.company}
            >
              {job.company}
            </p>
          </div>
        </div>
        <button className="text-gray-300 hover:text-blue-600 z-10 relative">
          <Bookmark className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Briefcase className="w-3.5 h-3.5 shrink-0" />{" "}
          <span className="truncate">{job.jobType}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 shrink-0" />{" "}
          <span className="truncate">{job.location}</span>
        </div>
      </div>

      {/* Footer: Gaji & Tanggal */}
      <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
        <span className="text-xs font-bold text-blue-700">
          {getFormattedSalary(job.salary)}
        </span>
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {getJobDate()}
        </span>
      </div>

      {/* Link Absolut agar seluruh card bisa diklik */}
      <Link href={`/jobs/${job._id}`} className="absolute inset-0 z-0" />
    </div>
  );
}
