import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { usePremiumFeatures } from "@/hooks/use-premium-features";

interface BlurOverlayProps {
  feature: string;
  requiredPlan: "pro" | "unicorn";
  description?: string;
}

export function BlurOverlay({ 
  feature, 
  requiredPlan, 
  description 
}: BlurOverlayProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { requestFeatureAccess } = usePremiumFeatures();
  
  const handleUpgrade = async () => {
    // Show the premium feature modal
    const hasAccess = await requestFeatureAccess({
      name: feature,
      description: description || `Access premium ${feature} features`,
      requiredPlan,
    });
    
    // If they want to proceed with upgrading
    if (hasAccess && user) {
      navigate("/pricing");
    } else if (hasAccess) {
      // User is not logged in but wants to proceed
      navigate("/auth?returnTo=/pricing");
    }
  };
  
  return (
    <div className="absolute inset-0 backdrop-blur-md bg-vision-bg/40 flex flex-col items-center justify-center z-10 p-6 text-center">
      <div className="w-16 h-16 bg-vision-primary-gradient rounded-full flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">
        Premium Feature
      </h3>
      
      <p className="text-white/70 max-w-sm mb-6">
        {description || `Access to detailed ${feature} requires a ${requiredPlan === "unicorn" ? "Unicorn" : "Pro"} plan or higher.`}
      </p>
      
      <Button 
        className="bg-vision-primary-gradient hover:brightness-110 text-white font-medium"
        onClick={handleUpgrade}
      >
        Upgrade Now
      </Button>
    </div>
  );
}