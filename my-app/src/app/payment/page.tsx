"use client";

import { useEffect, useState } from "react";
import { paymentService } from "@/services/paymentService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import {
  Loader2,
  Check,
  ShieldCheck,
  Zap,
  CreditCard,
  ArrowLeft,
  Crown,
} from "lucide-react";
import Link from "next/link";

interface TokenPackage {
  _id: string;
  name: string;
  type: string;
  tokens: number;
  price: number;
  description?: string;
  features?: string[];
  popular?: boolean;
}

declare global {
  interface Window {
    snap: any;
  }
}

export default function PaymentPage() {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadPackages();
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

  const loadPackages = async () => {
    try {
      // Kita tetap butuh token untuk auth, tapi tidak perlu fetch balance user
      const response = await fetch("http://localhost:3000/packages", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch packages");
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (packageType: string) => {
    try {
      setProcessingPayment(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Silakan login terlebih dahulu");
        router.push("/login");
        return;
      }
      const response = await paymentService.createPayment(packageType, token);

      if (window.snap) {
        window.snap.pay(response.data.snapToken, {
          onSuccess: function () {
            toast.success("Pembayaran berhasil!");
            router.push("/profile");
          },
          onPending: function () {
            toast.info("Menunggu pembayaran...");
            router.push("/profile");
          },
          onError: function () {
            toast.error("Pembayaran gagal!");
          },
        });
      } else {
        toast.error("Payment gateway belum siap");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal memproses pembayaran");
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-900 animate-spin mb-4" />
        <p className="text-zinc-500 text-xs font-medium tracking-widest uppercase">
          Memuat Paket...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100">
      <Navbar />

      <div className="pt-32 pb-24 container mx-auto px-6 max-w-6xl">
        {/* --- HEADER SECTION --- */}
        <div className="text-center mb-20 max-w-3xl mx-auto space-y-6">
          <Link
            href="/profile"
            className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-wider mb-4"
          >
            <ArrowLeft className="w-3 h-3 mr-2" /> Kembali ke Profil
          </Link>

          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-zinc-900 leading-tight">
            Pilih Paket <br />
            <span className="text-zinc-400">Sesuai Targetmu</span>
          </h1>
          <p className="text-lg text-zinc-500 font-light leading-relaxed max-w-xl mx-auto">
            Buka akses ke simulasi interview AI canggih dan analisis CV mendalam
            untuk mempercepat karir impianmu.
          </p>
        </div>

        {/* --- PRICING GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className={`relative flex flex-col p-8 rounded-[2rem] transition-all duration-500 group ${
                pkg.popular
                  ? "bg-zinc-900 text-white shadow-2xl scale-105 z-10 ring-1 ring-zinc-900"
                  : "bg-white border border-zinc-100 hover:border-zinc-200 hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <div className="bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                    <Crown className="w-3 h-3 fill-current" /> Paling Laris
                  </div>
                </div>
              )}

              {/* Card Header */}
              <div className="mb-8">
                <h3
                  className={`text-lg font-medium mb-2 ${pkg.popular ? "text-zinc-100" : "text-zinc-900"}`}
                >
                  {pkg.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-semibold tracking-tight">
                    {formatPrice(pkg.price)}
                  </span>
                </div>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                    pkg.popular
                      ? "bg-zinc-800 text-zinc-300"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {pkg.tokens} Token Kredit
                </div>
                {pkg.description && (
                  <p
                    className={`text-sm mt-6 leading-relaxed ${pkg.popular ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    {pkg.description}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <Button
                onClick={() => handlePayment(pkg.type.toLowerCase())}
                disabled={processingPayment}
                className={`w-full h-12 rounded-xl text-sm font-semibold tracking-wide transition-all mb-8 ${
                  pkg.popular
                    ? "bg-white text-zinc-900 hover:bg-zinc-100 border-0"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                {processingPayment ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                  </span>
                ) : (
                  "Pilih Paket Ini"
                )}
              </Button>

              {/* Divider */}
              <div
                className={`w-full h-px mb-8 ${pkg.popular ? "bg-zinc-800" : "bg-zinc-100"}`}
              ></div>

              {/* Features List */}
              <div className="space-y-4 flex-grow">
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-4 ${pkg.popular ? "text-zinc-500" : "text-zinc-400"}`}
                >
                  Fitur Unggulan
                </p>
                {(pkg.features && pkg.features.length > 0
                  ? pkg.features
                  : [
                      "Akses Selamanya",
                      "AI Interview Simulator",
                      "Analisis CV Mendalam",
                      "Rekomendasi Loker",
                    ]
                ).map((feature, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 text-sm ${pkg.popular ? "text-zinc-300" : "text-zinc-600"}`}
                  >
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${pkg.popular ? "text-emerald-400" : "text-emerald-600"}`}
                    />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* --- TRUST FOOTER --- */}
        <div className="mt-28 border-t border-zinc-100 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-900">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-900 text-sm">
                  Pembayaran Aman
                </h4>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Enkripsi SSL 256-bit via Midtrans.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-900">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-900 text-sm">
                  Aktivasi Instan
                </h4>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Token otomatis masuk dalam detik.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-900">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-900 text-sm">
                  Metode Lengkap
                </h4>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  QRIS, E-Wallet, & Transfer Bank.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
