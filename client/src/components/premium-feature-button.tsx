import { Button, ButtonProps } from "@/components/ui/button";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { Lock } from "lucide-react";
import { useState } from "react";

interface PremiumFeatureButtonProps extends ButtonProps {
  featureName: string;
  featureDescription: string;
  requiredPlan: "pro" | "unicorn";
  onPremiumAction: () => Promise<void>;
}

export function PremiumFeatureButton({
  featureName,
  featureDescription,
  requiredPlan,
  onPremiumAction,
  children,
  ...props
}: PremiumFeatureButtonProps) {
  const { requestFeatureAccess } = usePremiumFeatures();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    
    try {
      // Request access to the premium feature
      const hasAccess = await requestFeatureAccess({
        name: featureName,
        description: featureDescription,
        requiredPlan,
      });
      
      // If the user has access (either they have the right plan or they want to proceed anyway)
      if (hasAccess) {
        await onPremiumAction();
      }
    } catch (error) {
      console.error("Error with premium feature:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleClick}
      disabled={loading}
      {...props}
    >
      {loading ? (
        "Loading..."
      ) : (
        <>
          {children}
          <Lock className="ml-2 h-4 w-4 opacity-70" />
        </>
      )}
    </Button>
  );
}