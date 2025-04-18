import React from "react";
import { Lock } from "lucide-react";

interface BlurOverlayProps {
  feature: string;
}

export function BlurOverlay({ feature }: BlurOverlayProps) {
  return (
    <div className="absolute inset-0 backdrop-blur-[4px] z-10 flex items-center justify-center rounded-xl overflow-hidden">
      <div className="bg-background bg-opacity-75 px-4 py-2 rounded-lg flex items-center">
        <Lock className="text-primary mr-2 h-4 w-4" />
        <span className="text-sm font-medium">{feature} Feature</span>
      </div>
    </div>
  );
}
