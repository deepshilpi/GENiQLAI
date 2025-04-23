import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { StartupAnalyzer } from "@/components/startup-analyzer";
import { StartupAnalyzerResults } from "@/components/startup-analyzer-results";
import { PlanFeatures } from "@/components/plan-features";
import { useAuth } from "@/hooks/use-auth";
import { AnalysisResults } from "@shared/schema";
import { NewsArticles } from "@/components/news-articles";
import { detectUserCountry } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const [startupIdea, setStartupIdea] = useState("");
  const [country, setCountry] = useState(detectUserCountry());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  
  const handleAnalysis = async () => {
    if (!startupIdea.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // In a real implementation, this would call the backend API
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startupIdea, country }),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze startup idea");
      }
      
      const results = await response.json();
      setAnalysisResults(results);
    } catch (error) {
      console.error("Error analyzing startup idea:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="ml-64 flex-1 flex flex-col">
        <Header />
        
        <main className="p-6 flex-1">
          {/* Welcome Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-card rounded-xl p-5 lg:col-span-1">
              <h1 className="text-2xl font-bold mb-1">Welcome to GENIQL</h1>
              <p className="text-muted-foreground mb-4">Your AI-powered startup idea analyzer</p>
              
              <StartupAnalyzer 
                startupIdea={startupIdea}
                setStartupIdea={setStartupIdea}
                isAnalyzing={isAnalyzing}
                onAnalyze={handleAnalysis}
              />
            </div>
            
            <div className="bg-card rounded-xl overflow-hidden lg:col-span-2">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold">Your Current Plan</h2>
                  <span className="bg-primary bg-opacity-20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                    {user?.planType?.charAt(0).toUpperCase() + user?.planType?.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-accent rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground">Analyses</div>
                      <div className="text-xs bg-warning bg-opacity-20 text-warning px-2 py-0.5 rounded-full">5 remaining</div>
                    </div>
                    <div className="text-xl font-bold">5/10</div>
                    <div className="w-full bg-background-light rounded-full h-1.5 mt-2">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: "50%" }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-accent rounded-xl p-4">
                    <div className="text-sm text-muted-foreground mb-2">Features</div>
                    <div className="text-xl font-bold">
                      {user?.planType === "free" ? "4/8" : user?.planType === "pro" ? "8/8" : "10/10"}
                    </div>
                    <div className="w-full bg-background-light rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-primary h-1.5 rounded-full" 
                        style={{ 
                          width: user?.planType === "free" ? "50%" : 
                                 user?.planType === "pro" ? "80%" : "100%" 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-primary bg-opacity-10 rounded-xl p-4 flex flex-col">
                    <div className="text-sm text-muted-foreground mb-auto">
                      {user?.planType === "unicorn" ? "You're on our top plan!" : "Upgrade now"}
                    </div>
                    {user?.planType !== "unicorn" && (
                      <button className="bg-primary text-white rounded-lg py-2 text-sm hover:bg-opacity-90 transition-colors">
                        View Plans
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResults && (
            <StartupAnalyzerResults results={analysisResults} userPlan={user?.planType || "free"} />
          )}

          {/* Unicorn Features */}
          {user?.planType !== "unicorn" && (
            <PlanFeatures />
          )}
          
          {/* News Articles (Pro feature) */}
          {(user?.planType === "pro" || user?.planType === "unicorn") && (
            <NewsArticles />
          )}
        </main>
      </div>
    </div>
  );
}
