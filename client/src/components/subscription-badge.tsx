import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BadgeCheck, Rocket } from "lucide-react";

export function SubscriptionBadge() {
  const { userPlan, planLabel } = usePremiumFeatures();
  
  const getBadgeColor = () => {
    switch (userPlan) {
      case "unicorn":
        return "bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600";
      case "pro":
        return "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600";
      default:
        return "bg-gradient-to-r from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800";
    }
  };
  
  const getPlanIcon = () => {
    switch (userPlan) {
      case "unicorn":
        return <Sparkles className="h-3 w-3 mr-1" />;
      case "pro":
        return <BadgeCheck className="h-3 w-3 mr-1" />;
      default:
        return <Rocket className="h-3 w-3 mr-1" />;
    }
  };
  
  return (
    <Badge className={`flex items-center text-white ${getBadgeColor()}`}>
      {getPlanIcon()}
      {planLabel} Plan
    </Badge>
  );
}