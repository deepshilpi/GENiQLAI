import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { BadgeCheck, Rocket, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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
  const [isTyping, setIsTyping] = useState(false);
  const demoIdeas = [
    "An AI-driven mental health platform that provides personalized therapy recommendations and tracks progress over time.",
    "A blockchain-based supply chain tracking system for Indian farmers to eliminate middlemen and increase profits.",
    "A smart water management solution using IoT sensors to reduce wastage in urban areas.",
    "A platform that connects rural artisans directly with global markets using AR/VR product showcases."
  ];
  const demoIdeaRef = useRef(0);
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);
  
  // Typing animation effect
  useEffect(() => {
    if (!startupIdea && !isTyping && !isAnalyzing) {
      // Start typing animation after 2 seconds of page load
      const timeout = setTimeout(() => {
        setIsTyping(true);
        let currentIndex = 0;
        const currentDemoIdea = demoIdeas[demoIdeaRef.current % demoIdeas.length];
        
        const typeNextCharacter = () => {
          if (currentIndex <= currentDemoIdea.length) {
            setStartupIdea(currentDemoIdea.substring(0, currentIndex));
            currentIndex++;
            typewriterRef.current = setTimeout(typeNextCharacter, Math.random() * 50 + 30); // Random typing speed for realism
          } else {
            setIsTyping(false);
            demoIdeaRef.current += 1; // Move to next idea for next time
          }
        };
        
        typeNextCharacter();
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
    
    return () => {
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current);
      }
    };
  }, [startupIdea, isTyping, isAnalyzing, setStartupIdea, demoIdeas]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startupIdea.trim()) {
      onAnalyze();
    }
  };
  
  const handleInputFocus = () => {
    // Stop typing animation when user focuses on input
    setIsTyping(false);
    if (typewriterRef.current) {
      clearTimeout(typewriterRef.current);
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
      <div>
        <Textarea
          value={startupIdea}
          onChange={(e) => setStartupIdea(e.target.value)}
          onFocus={handleInputFocus}
          onClick={handleInputFocus}
          className="w-full py-3 px-4 rounded-xl bg-accent border border-border text-white placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
          placeholder="Enter your startup idea..."
          disabled={isAnalyzing}
        />
        <div className="flex justify-end mt-2">
          <Button
            type="submit"
            className="bg-vision-primary-gradient text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all"
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
