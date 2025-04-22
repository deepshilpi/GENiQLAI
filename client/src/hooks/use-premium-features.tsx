import { useState, createContext, useContext, ReactNode, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PremiumFeatureModal } from "@/components/premium-feature-modal";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type PlanType = "free" | "pro" | "unicorn";

type FeatureDetails = {
  name: string;
  description: string;
  requiredPlan: "pro" | "unicorn";
};

interface PremiumFeaturesContextType {
  checkAccess: (featurePlan: "pro" | "unicorn") => boolean;
  requestFeatureAccess: (feature: FeatureDetails) => Promise<boolean>;
  isPro: boolean;
  isUnicorn: boolean;
  userPlan: PlanType;
  planLabel: string;
  getRequiredPlanLabel: (plan: "pro" | "unicorn") => string;
}

const PremiumFeaturesContext = createContext<PremiumFeaturesContextType | null>(null);

const PLAN_LABELS = {
  free: "Free",
  pro: "Pro",
  unicorn: "Unicorn"
};

export function PremiumFeaturesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<FeatureDetails | null>(null);
  const [resolveAccess, setResolveAccess] = useState<((value: boolean) => void) | null>(null);

  const userPlan = (user?.planType || "free") as PlanType;
  const planLabel = PLAN_LABELS[userPlan];
  
  // Derived states
  const isPro = userPlan === "pro" || userPlan === "unicorn";
  const isUnicorn = userPlan === "unicorn";

  // Get a readable label for a required plan
  const getRequiredPlanLabel = useCallback((plan: "pro" | "unicorn"): string => {
    return plan === "unicorn" ? "Unicorn" : "Pro";
  }, []);

  // Check if user has access to features of a given plan
  const checkAccess = useCallback((featurePlan: "pro" | "unicorn"): boolean => {
    if (featurePlan === "pro" && isPro) {
      return true;
    }
    if (featurePlan === "unicorn" && isUnicorn) {
      return true;
    }
    return false;
  }, [isPro, isUnicorn]);

  // Request access to a premium feature
  const requestFeatureAccess = useCallback((feature: FeatureDetails): Promise<boolean> => {
    // If they already have access, just return true
    if (checkAccess(feature.requiredPlan)) {
      return Promise.resolve(true);
    }

    // If user is on a plan but needs a higher one, show toast with quick upgrade option
    if (user && userPlan !== "free" && feature.requiredPlan === "unicorn" && userPlan === "pro") {
      toast({
        title: "Unicorn Plan Required",
        description: "This feature requires the Unicorn plan. Would you like to upgrade?",
        action: <button 
          onClick={() => navigate("/pricing")}
          className="bg-vision-primary-gradient px-3 py-1.5 text-xs rounded-md text-white"
        >
          Upgrade Now
        </button>,
      });
      return Promise.resolve(false);
    }

    // Otherwise, show modal and return a promise
    return new Promise((resolve) => {
      setCurrentFeature(feature);
      setResolveAccess(() => resolve);
      setIsModalOpen(true);
    });
  }, [checkAccess, user, userPlan, toast, navigate]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    if (resolveAccess) {
      resolveAccess(false);
      setResolveAccess(null);
    }
  }, [resolveAccess]);

  return (
    <PremiumFeaturesContext.Provider value={{ 
      checkAccess, 
      requestFeatureAccess,
      isPro,
      isUnicorn,
      userPlan,
      planLabel,
      getRequiredPlanLabel
    }}>
      {children}
      {currentFeature && (
        <PremiumFeatureModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          feature={currentFeature}
        />
      )}
    </PremiumFeaturesContext.Provider>
  );
}

export function usePremiumFeatures() {
  const context = useContext(PremiumFeaturesContext);
  if (!context) {
    throw new Error("usePremiumFeatures must be used within a PremiumFeaturesProvider");
  }
  return context;
}