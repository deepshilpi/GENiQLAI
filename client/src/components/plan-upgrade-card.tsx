import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { useLocation } from "wouter";
import { BadgeCheck, Sparkles, Rocket, Check } from "lucide-react";

interface PlanUpgradeCardProps {
  className?: string;
}

export function PlanUpgradeCard({ className = "" }: PlanUpgradeCardProps) {
  const { userPlan, isPro, isUnicorn } = usePremiumFeatures();
  const [, navigate] = useLocation();
  
  // If already on unicorn plan, don't show the upgrade card
  if (isUnicorn) return null;
  
  const getNextPlanDetails = () => {
    if (isPro) {
      return {
        name: "Unicorn",
        icon: <Sparkles className="h-5 w-5 text-amber-400" />,
        features: [
          "Complete analysis of all startup metrics",
          "Execution plan with detailed timeline",
          "Access to investor recommendations with contacts",
          "Priority customer support"
        ],
        price: "$29.99",
        ctaText: "Upgrade to Unicorn",
        gradientClass: "from-amber-500 to-fuchsia-500"
      };
    }
    
    return {
      name: "Pro",
      icon: <BadgeCheck className="h-5 w-5 text-blue-400" />,
      features: [
        "Everything in Free plan",
        "Detailed market and competitor analysis",
        "CAGR and funding requirement breakdown",
        "Go-to-market strategy"
      ],
      price: "$9.99",
      ctaText: "Upgrade to Pro",
      gradientClass: "from-blue-500 to-purple-500"
    };
  };
  
  const planDetails = getNextPlanDetails();
  
  return (
    <Card className={`vision-card border-vision-purple-300/20 overflow-hidden ${className}`}>
      <div className={`h-2 w-full bg-gradient-to-r ${planDetails.gradientClass}`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-bold flex items-center">
            {planDetails.icon}
            <span className="ml-2">{planDetails.name} Plan</span>
          </CardTitle>
          <CardDescription>
            Upgrade for premium features
          </CardDescription>
        </div>
        <div className="text-xl font-bold text-white">
          {planDetails.price}
          <span className="text-xs text-muted-foreground ml-1">/mo</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-2">
          {planDetails.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
              <span className="text-sm text-white/90">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={`w-full bg-gradient-to-r ${planDetails.gradientClass} hover:brightness-110 transition-all`}
          onClick={() => navigate("/pricing")}
        >
          {planDetails.ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
}