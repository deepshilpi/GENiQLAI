import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { BadgeCheck, Rocket, Sparkles } from "lucide-react";

interface StartupAnalyzerProps {
  startupIdea: string;
  setStartupIdea: React.Dispatch<React.SetStateAction<string>>;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export function StartupAnalyzer({
  startupIdea,
  setStartupIdea,
  isAnalyzing,
  onAnalyze
}: StartupAnalyzerProps) {
  const { user } = useAuth();
  const { isPro, isUnicorn, userPlan, planLabel } = usePremiumFeatures();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startupIdea.trim()) {
      onAnalyze();
    }
  };
  
  // Get the plan icon based on user's subscription level
  const getPlanIcon = () => {
    if (isUnicorn) return <Sparkles size={14} className="text-amber-400 mr-1" />;
    if (isPro) return <BadgeCheck size={14} className="text-blue-400 mr-1" />;
    return <Rocket size={14} className="text-gray-400 mr-1" />;
  };

  // Get text description of what the user can access
  const getFeatureAccessText = () => {
    if (isUnicorn) {
      return "Unicorn plan: Access to all analysis features including investor recommendations";
    } else if (isPro) {
      return "Pro plan: Access to detailed market analysis and execution planning";
    } else {
      return "Free plan: Basic analysis only (4 blocks). Upgrade for full analysis.";
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Input
          value={startupIdea}
          onChange={(e) => setStartupIdea(e.target.value)}
          className="w-full py-3 px-4 rounded-xl bg-accent border border-border text-white placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Enter your startup idea..."
          disabled={isAnalyzing}
        />
        <Button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-vision-primary-gradient text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all"
          disabled={isAnalyzing || !startupIdea.trim()}
        >
          {isAnalyzing ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Analyzing...
            </>
          ) : (
            "Analyze"
          )}
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          {getPlanIcon()}
          <span>{getFeatureAccessText()}</span>
        </div>
        
        {!isPro && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs border-vision-purple-400 text-vision-purple-400 hover:bg-vision-purple-400/10"
            onClick={() => window.location.href = "/pricing"}
          >
            Upgrade
          </Button>
        )}
      </div>
      
      {startupIdea.length > 0 && startupIdea.length < 15 && (
        <div className="text-xs text-amber-400">
          <span className="mr-1">⚠️</span>
          Your idea description is quite short. Add more details for better analysis results.
        </div>
      )}
    </form>
  );
}
