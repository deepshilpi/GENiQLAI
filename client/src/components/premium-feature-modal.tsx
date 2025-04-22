import { BrainCircuit, Check, X } from "lucide-react";
import { useLocation } from "wouter";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface PremiumFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: {
    name: string;
    description: string;
    requiredPlan: "pro" | "unicorn";
  };
}

export function PremiumFeatureModal({
  isOpen,
  onClose,
  feature,
}: PremiumFeatureModalProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const handleUpgrade = () => {
    onClose();
    navigate("/pricing");
  };
  
  const handleLogin = () => {
    onClose();
    navigate("/auth");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="vision-card sm:max-w-[480px] border-vision-purple-300/20 text-white">
        <DialogHeader>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-vision-primary-gradient flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-2xl text-center">Premium Feature</DialogTitle>
          <DialogDescription className="text-center text-white/70">
            Unlock advanced features with a premium plan
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="bg-vision-purple-100/10 p-4 rounded-lg">
              <h3 className="font-semibold text-white">{feature.name}</h3>
              <p className="text-sm text-white/70 mt-1">{feature.description}</p>
              <div className="mt-3 text-sm text-white/60">
                <span className="font-medium text-vision-purple-700">Required Plan: </span>
                {feature.requiredPlan === "unicorn" ? "Unicorn" : "Pro or Unicorn"}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm text-white/80">Detailed market analysis</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm text-white/80">Execution roadmap with timeline</span>
              </div>
              {feature.requiredPlan === "unicorn" && (
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-white/80">Investor matching with Crunchbase links</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-col gap-2">
          {!user ? (
            <>
              <Button 
                className="w-full bg-vision-primary-gradient hover:brightness-110 text-white font-medium" 
                onClick={handleLogin}
              >
                Sign in
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={onClose}
              >
                Continue as guest
              </Button>
            </>
          ) : (
            <>
              <Button 
                className="w-full bg-vision-primary-gradient hover:brightness-110 text-white font-medium" 
                onClick={handleUpgrade}
              >
                Upgrade to {feature.requiredPlan === "unicorn" ? "Unicorn" : "Pro"}
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={onClose}
              >
                Maybe later
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}