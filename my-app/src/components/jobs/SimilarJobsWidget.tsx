"use client";

import { useEffect, useState } from "react";
import { jobService } from "@/services/jobService";
import { Job } from "@/types";
import MiniJobCard from "./MiniJobCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function SimilarJobsWidget({
  currentJobId,
  category,
}: {
  currentJobId: string;
  category: string;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        // Logika Sederhana: Ambil semua, lalu filter di client (karena backend belum ada endpoint similar)
        // Idealnya: endpoint /jobs/similar?id=...
        const res = await jobService.getAllJobs(1, 20); // Ambil 20 data terbaru

        const filtered = res.data
          .filter((j: Job) => j._id !== currentJobId) // Jangan tampilkan job yg sedang dibuka
          // Filter sederhana: Cek apakah title mengandung kata kunci dari kategori (misal "Designer")
          // Atau tampilkan saja random latest jobs sebagai "Loker Lainnya"
          .slice(0, 3); // Ambil 3 saja

        setJobs(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [currentJobId]);

  if (loading)
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  if (jobs.length === 0) return null;

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <MiniJobCard key={job._id} job={job} />
      ))}
    </div>
  );
}
