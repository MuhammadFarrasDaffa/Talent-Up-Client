import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-zinc-100 pt-20 pb-10 overflow-hidden relative">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Top Section: Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-32">
          {/* Brand Promise (Left) */}
          <div className="md:col-span-5 space-y-6">
            <h3 className="text-2xl font-medium text-zinc-900 leading-snug">
              Membangun masa depan karir dengan kecerdasan buatan dan koneksi
              tanpa batas.
            </h3>
            <div className="flex gap-4">
              <Link href="/login">
                <button className="bg-zinc-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-zinc-800 transition-all">
                  Mulai Sekarang
                </button>
              </Link>
            </div>
          </div>

          {/* Spacer */}
          <div className="md:col-span-1"></div>

          {/* Navigation Links (Right) */}
          <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                Platform
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/jobs"
                    className="text-zinc-600 hover:text-zinc-900 text-sm block"
                  >
                    Cari Lowongan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cv-generator"
                    className="text-zinc-600 hover:text-zinc-900 text-sm block"
                  >
                    CV Generator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/interview"
                    className="text-zinc-600 hover:text-zinc-900 text-sm block"
                  >
                    AI Interview
                  </Link>
                </li>
                <li>
                  <Link
                    href="/payment"
                    className="text-zinc-600 hover:text-zinc-900 text-sm block"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-zinc-600 hover:text-zinc-900 text-sm block"
                  >
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-zinc-600 hover:text-zinc-900 text-sm block"
                  >
                    Blog Karir
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-zinc-600 hover:text-zinc-900 text-sm block flex items-center gap-1"
                  >
                    Karir{" "}
                    <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500">
                      Hiring
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-zinc-600 hover:text-zinc-900 text-sm block"
                  >
                    Hubungi Kami
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-zinc-600 hover:text-zinc-900 text-sm block"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-zinc-600 hover:text-zinc-900 text-sm block"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="text-zinc-600 hover:text-zinc-900 text-sm block"
                  >
                    Cookie Settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* BIG TYPOGRAPHY (Antigravity Style) */}
        <div className="border-t border-zinc-100 pt-10">
          <h1 className="text-[14vw] leading-[0.8] font-bold tracking-tighter text-zinc-900 text-center select-none pointer-events-none">
            Seekers.
          </h1>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-400 font-medium">
          <p>&copy; {currentYear} Seekers Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <a
              href="#"
              className="hover:text-zinc-900 transition-colors flex items-center gap-1"
            >
              Instagram <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="#"
              className="hover:text-zinc-900 transition-colors flex items-center gap-1"
            >
              LinkedIn <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="#"
              className="hover:text-zinc-900 transition-colors flex items-center gap-1"
            >
              Twitter <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
