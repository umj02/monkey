"use client";

import Lottie from "lottie-react";
import infoAnimation from "@/public/assets/lottie/info.json";

export function LottieAlertIcon({ className = "h-20 w-20" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Lottie animationData={infoAnimation} loop autoplay />
    </div>
  );
}
