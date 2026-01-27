/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { paymentService } from "@/services/paymentService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

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
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    loadPackages();
    loadTokenBalance();
    loadMidtransScript();

    // Listen for storage changes (when token balance updates from finish page)
    const handleStorageChange = () => {
      loadTokenBalance();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
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
      const response = await fetch("http://localhost:3000/packages", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch packages");
      }

      const data = await response.json();
      setPackages(data.packages || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const loadTokenBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await paymentService.getTokenBalance(token);
        setTokenBalance(response.data.tokenBalance);
      }
    } catch (error: any) {
      console.error("Failed to load token balance:", error);
    }
  };

  const handlePayment = async (packageType: string) => {
    try {
      setProcessingPayment(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login first");
        router.push("/login");
        return;
      }

      const response = await paymentService.createPayment(packageType, token);

      // Open Midtrans Snap
      if (window.snap) {
        window.snap.pay(response.data.snapToken, {
          onSuccess: function (result: any) {
            toast.success("Payment successful!");
            loadTokenBalance();
            router.push("/payment/success");
          },
          onPending: function (result: any) {
            toast.info("Waiting for payment...");
            router.push("/payment/pending");
          },
          onError: function (result: any) {
            toast.error("Payment failed!");
            router.push("/payment/error");
          },
          onClose: function () {
            toast.info("Payment cancelled");
          },
        });
      } else {
        toast.error("Payment gateway not loaded");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading packages...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Navbar />
      <div className="mb-8 mt-12">
        <h1 className="text-3xl font-bold mb-2">Buy Tokens</h1>
        <p className="text-muted-foreground">
          Choose a package to add tokens to your account
        </p>
        <div className="mt-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Current Balance: {tokenBalance} Tokens
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card
            key={pkg._id}
            className={`${
              pkg.popular ? "border-primary shadow-lg" : ""
            } hover:shadow-xl transition-shadow`}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {pkg.name}
                {pkg.popular && <Badge variant="default">Most Popular</Badge>}
              </CardTitle>
              <CardDescription>
                {pkg.description || `Get ${pkg.tokens} tokens for your account`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-4xl font-bold mb-2">
                  {formatPrice(pkg.price)}
                </div>
                <div className="text-muted-foreground">{pkg.tokens} Tokens</div>
                <div className="text-sm text-muted-foreground mt-2">
                  {formatPrice(pkg.price / pkg.tokens)} / token
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {pkg.features && pkg.features.length > 0 ? (
                  pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Valid for 1 year</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>AI Interview Practice</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>CV Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Job Recommendations</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handlePayment(pkg.type)}
                disabled={processingPayment}
                className="w-full"
                variant={pkg.popular ? "default" : "outline"}
              >
                {processingPayment ? "Processing..." : "Buy Now"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Secure payment powered by Midtrans</p>
            <p>• Multiple payment methods available</p>
            <p>
              • Tokens will be added to your account immediately after
              successful payment
            </p>
            <p>• For any payment issues, please contact our support</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
