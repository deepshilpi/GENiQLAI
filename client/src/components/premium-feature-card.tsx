import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { useState } from "react";

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  requiredPlan: "pro" | "unicorn";
  onAction: () => Promise<void>;
  actionText: string;
  className?: string;
}

export function PremiumFeatureCard({
  title,
  description,
  icon,
  requiredPlan,
  onAction,
  actionText,
  className = "",
}: PremiumFeatureCardProps) {
  const { checkAccess, requestFeatureAccess, getRequiredPlanLabel } = usePremiumFeatures();
  const [loading, setLoading] = useState(false);
  
  const hasAccess = checkAccess(requiredPlan);
  
  const handleClick = async () => {
    setLoading(true);
    
    try {
      if (hasAccess) {
        // User already has access, perform the action directly
        await onAction();
      } else {
        // User needs to upgrade
        const willUpgrade = await requestFeatureAccess({
          name: title,
          description,
          requiredPlan,
        });
        
        if (willUpgrade) {
          await onAction();
        }
      }
    } catch (error) {
      console.error("Error performing premium action:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className={`vision-card border-vision-purple-300/20 h-full ${className}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          {icon}
        </div>
        {!hasAccess && (
          <div className="flex items-center text-xs bg-vision-purple-300/20 text-vision-purple-300 p-1 px-2 rounded-full">
            <Lock className="w-3 h-3 mr-1" />
            <span>{getRequiredPlanLabel(requiredPlan)} only</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-white/70">{description}</p>
      </CardContent>
      <CardFooter>
        <Button
          className={`w-full ${
            hasAccess 
              ? "bg-vision-primary-gradient hover:brightness-110" 
              : "bg-vision-purple-300/20 hover:bg-vision-purple-300/30"
          }`}
          disabled={loading}
          onClick={handleClick}
        >
          {loading ? (
            "Loading..."
          ) : (
            <>
              {actionText}
              {!hasAccess && <Lock className="w-4 h-4 ml-2" />}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}