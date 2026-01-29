"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { paymentService } from "@/services/paymentService";

export default function PaymentFinishPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const transactionStatus = searchParams.get("transaction_status");
      const orderId = searchParams.get("order_id");

      if (!orderId) {
        router.replace("/payment");
        return;
      }

      try {
        // Call backend to check status and update tokens
        const token = localStorage.getItem("token");
        if (token) {
          await paymentService.checkStatus(orderId, token);
        }

        // Handle different transaction statuses
        if (
          transactionStatus === "capture" ||
          transactionStatus === "settlement"
        ) {
          router.replace("/profile");
        } else if (transactionStatus === "pending") {
          toast.info("Waiting for payment...");
          router.replace("/payment/pending");
        } else if (
          transactionStatus === "deny" ||
          transactionStatus === "cancel" ||
          transactionStatus === "expire"
        ) {
          toast.error("Payment failed!");
          router.replace("/payment/error");
        } else {
          // Unknown status, redirect to payment page
          router.replace("/payment");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        // Still redirect even if verification fails
        if (
          transactionStatus === "capture" ||
          transactionStatus === "settlement"
        ) {
          // router.replace("/payment/success");
        } else {
          router.replace("/payment/error");
        }
      } finally {
        setIsProcessing(false);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Processing your payment...</p>
        </div>
      </div>
    </div>
  );
}
