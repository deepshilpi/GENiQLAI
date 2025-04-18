import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startupIdea.trim()) {
      onAnalyze();
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="relative mb-4">
        <Input
          value={startupIdea}
          onChange={(e) => setStartupIdea(e.target.value)}
          className="w-full py-3 px-4 rounded-xl bg-accent border border-border text-white placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Enter your startup idea..."
          disabled={isAnalyzing}
        />
        <Button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
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
      <div className="text-xs text-muted-foreground">
        <i className="fas fa-info-circle mr-1"></i> 
        {user?.planType === "free" 
          ? "Free users get access to the first 4 analysis blocks" 
          : user?.planType === "pro"
          ? "Pro users get access to all 8 analysis blocks"
          : "Unicorn users get access to all features"}
      </div>
    </form>
  );
}
