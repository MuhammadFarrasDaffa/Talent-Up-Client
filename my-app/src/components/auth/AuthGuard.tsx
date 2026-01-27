"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // 1. Ambil token dari LocalStorage
      const token = localStorage.getItem("token");

      // 2. Daftar Halaman
      const guestRoutes = ["/login", "/register"]; // Hanya untuk yang BELUM login
      const publicRoutes = ["/dashboard", "/jobs"]; // Bisa diakses siapa saja
      // Note: /jobs detail (misal /jobs/123) juga harus dianggap public. Kita pakai logic startsWith nanti.

      // 3. Logic Pengecekan

      // Skenario A: User SUDAH Login
      if (token) {
        // Jika mencoba akses halaman login/register, lempar ke dashboard
        if (guestRoutes.includes(pathname)) {
          router.replace("/dashboard");
          return;
        }
      }

      // Skenario B: User BELUM Login
      else {
        // Cek apakah halaman saat ini adalah halaman public
        const isPublic =
          publicRoutes.includes(pathname) ||
          pathname.startsWith("/jobs/") ||
          guestRoutes.includes(pathname);

        // Jika BUKAN halaman public (artinya halaman private seperti dashboard/profile), lempar ke login
        if (!isPublic) {
          router.replace("/login");
          return;
        }
      }

      // Jika aman, matikan loading
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Tampilkan Loading Spinner saat sedang mengecek (agar tidak flickering)
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500 font-medium">
            Memeriksa akses...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
