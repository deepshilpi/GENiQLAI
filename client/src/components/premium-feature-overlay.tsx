import { ReactNode, useState } from "react";
import { Lock, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PremiumFeatureOverlayProps {
  title: string;
  description: string;
  icon: ReactNode;
  requiredPlan: "pro" | "unicorn";
}

export function PremiumFeatureOverlay({
  title,
  description,
  icon,
  requiredPlan,
}: PremiumFeatureOverlayProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [upgrading, setUpgrading] = useState(false);
  
  // Handle upgrade
  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your plan.",
        variant: "destructive",
      });
      return;
    }
    
    setUpgrading(true);
    
    try {
      const response = await apiRequest("POST", "/api/user/plan", {
        planType: requiredPlan,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upgrade plan");
      }
      
      toast({
        title: "Plan Upgraded",
        description: `You've been upgraded to the ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} plan!`,
      });
      
      // Reload to update UI
      window.location.reload();
    } catch (error) {
      console.error("Error upgrading plan:", error);
      toast({
        title: "Upgrade Failed",
        description: "There was a problem upgrading your plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col items-center justify-center p-6 text-center border border-dashed border-vision-purple-200/30 bg-vision-card/50 backdrop-blur-sm">
      <CardContent className="pt-6 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="opacity-50">{icon}</div>
          <div className="absolute -bottom-2 -right-2 bg-vision-primary-gradient rounded-full p-1.5">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-sm text-white/70 mb-4">
          {description}
        </p>
        
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 bg-vision-primary-gradient/10 border-primary/30 hover:bg-vision-primary-gradient/20 text-white"
          onClick={handleUpgrade}
          disabled={upgrading}
        >
          {upgrading ? (
            <>Upgrading...</>
          ) : (
            <>
              <Crown className="w-3.5 h-3.5" />
              Upgrade to {requiredPlan === "pro" ? "Pro" : "Unicorn"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}