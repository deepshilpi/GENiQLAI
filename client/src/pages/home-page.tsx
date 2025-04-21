import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { detectUserCountry } from "@/lib/utils";
import { SampleAnalysisDemo } from "@/components/sample-analysis-demo";
import { OnboardingTour } from "@/components/onboarding-tour";
import { IndustryTemplateSelector } from "@/components/industry-template-selector";
import { 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  Loader2
} from "lucide-react";
import * as THREE from "three";

export default function HomePage() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [startupIdea, setStartupIdea] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      // If user is on home page but not logged in, let them see the landing
      // but disable the actual analysis functionality
    } else {
      // Check if this is the user's first time (using localStorage)
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setIsNewUser(true);
        setShowOnboarding(true);
      }
    }
  }, [user, navigate]);
  
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [analysisStep, setAnalysisStep] = useState<'input' | 'results'>('input');
  
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };
  
  const handleSelectTemplate = (template: string) => {
    setStartupIdea(template);
    setShowTemplateSelector(false);
    toast({
      title: "Template Selected",
      description: "Customize the template by editing it to match your specific idea.",
    });
  };
  
  const handleAnalyze = async () => {
    // Require login for analysis
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to analyze your startup idea",
        variant: "default",
      });
      navigate('/auth');
      return;
    }
    
    if (!startupIdea.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      // Call the server API to analyze the startup idea
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          startupIdea, 
          country: detectUserCountry()
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze startup idea');
      }
      
      // Get results and update state
      const results = await response.json();
      setAnalysisResults(results);
      setAnalysisStep('results');
    } catch (error) {
      console.error("Error analyzing startup idea:", error);
      
      // Extract error message from response if available
      let errorMessage = "We couldn't analyze your startup idea at this moment. Please try again later.";
      
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          errorMessage = "Analysis is taking too long. Please try a shorter description or try again later.";
        } else if (error.message.includes("content policy")) {
          errorMessage = "Your startup idea couldn't be analyzed due to content policy. Please revise and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      // Use a toast notification instead of an alert for a better user experience
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-vision-bg flex">
      {/* Onboarding Tour */}
      <OnboardingTour 
        showTour={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />
      
      <div className="flex-1 flex flex-col main-content transition-all duration-300">
        
        <main className="flex-grow flex items-center justify-center overflow-hidden relative px-6 py-12">
          
          {/* Content based on analysis step */}
          {analysisStep === 'input' ? (
            /* Centered prompt box */
            <div className="w-full max-w-5xl flex flex-col">
              <div className="vision-card overflow-hidden p-8 relative">
                {/* Glowing effect at the top */}
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full" 
                  style={{
                    background: "radial-gradient(circle, rgba(161, 99, 247, 0.3) 0%, rgba(161, 99, 247, 0) 70%)",
                    filter: "blur(20px)"
                  }}
                />
                
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-3 mb-6 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-xl bg-vision-primary-gradient flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">GENIQL AI Startup Analysis</h1>
                    <p className="text-white/60 text-sm">Analyze your startup idea with AI-powered insights</p>
                  </div>
                </div>
                
                {/* Login prompt for anonymous users */}
                {!user && (
                  <div className="mb-6 px-3 py-2 rounded-md bg-vision-purple-900/30 border border-vision-purple-400/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white text-sm font-medium">Authentication Required</span>
                    </div>
                    <p className="text-white/60 text-sm mt-1">
                      Sign in or create an account to analyze your startup idea
                    </p>
                    <div className="mt-3">
                      <Button 
                        onClick={() => navigate('/auth')}
                        className="bg-vision-primary-gradient hover:brightness-110 transition-all text-white font-medium w-full"
                      >
                        Sign in / Create Account
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <div className="flex flex-wrap justify-between items-center mb-2">
                    <label htmlFor="startup-idea" className="text-white/90 font-medium">
                      Describe your startup idea in detail
                    </label>
                    {user && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                        className="text-white/70 border-vision-purple-200/20 hover:bg-vision-purple-100/10 text-xs"
                      >
                        {showTemplateSelector ? 'Hide Templates' : 'Use Template'}
                      </Button>
                    )}
                  </div>
                  
                  {showTemplateSelector && (
                    <div className="mb-6 bg-vision-card/40 border border-vision-purple-200/20 rounded-lg p-4">
                      <IndustryTemplateSelector onSelect={handleSelectTemplate} />
                    </div>
                  )}
                  
                  <Textarea
                    id="startup-idea"
                    value={startupIdea}
                    onChange={(e) => setStartupIdea(e.target.value)}
                    placeholder="Example: A subscription service that delivers personalized book recommendations based on AI analysis of reading preferences and behavior..."
                    className="h-32 bg-vision-card/80 border-vision-purple-200/20 text-white placeholder:text-white/40 focus:border-vision-purple-500"
                  />
                </div>
                
                <div className="flex justify-center sm:justify-end">
                  <Button 
                    onClick={handleAnalyze}
                    disabled={!startupIdea.trim() || isAnalyzing}
                    className="bg-vision-primary-gradient hover:brightness-110 transition-all text-white font-medium w-full sm:w-auto"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Analyze My Startup Idea</span>
                        <span className="sm:hidden">Analyze Idea</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Bottom glowing effect */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20" 
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(161, 99, 247, 0.15) 0%, rgba(161, 99, 247, 0) 70%)",
                    filter: "blur(20px)"
                  }}
                />
              </div>
              
              {/* Sample Analysis Demo for anonymous users */}
              {!user && (
                <div className="mt-16">
                  <SampleAnalysisDemo />
                </div>
              )}
            </div>
          ) : (
            /* Analysis Results */
            <div className="w-full max-w-7xl">
              <div className="flex flex-col space-y-6">
                {/* Header with back button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <Button 
                    variant="ghost" 
                    className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 self-start"
                    onClick={() => setAnalysisStep('input')}
                  >
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Back to Input
                  </Button>
                  
                  <div className="flex items-center">
                    <Button 
                      variant="ghost"
                      className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 mr-2 header-actions"
                    >
                      Share Results
                    </Button>
                    <Button 
                      className="bg-vision-primary-gradient hover:brightness-110 transition-all text-white"
                    >
                      Save Analysis
                    </Button>
                  </div>
                </div>
                
                {/* Idea summary */}
                <div className="vision-card p-6">
                  <h2 className="text-xl font-bold text-white mb-2">Analyzed Startup Idea</h2>
                  <p className="text-white/80">{startupIdea}</p>
                </div>
                
                {/* Results grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 results-grid">
                  {/* Success Rate */}
                  {analysisResults?.successRate && (
                    <div className="vision-card p-6 flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-4">Success Rate</h3>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative w-32 h-32 mb-4">
                          <div className="absolute inset-0 rounded-full border-8 border-vision-purple-100/20"></div>
                          <div 
                            className="absolute inset-0 rounded-full border-8 border-vision-primary-gradient"
                            style={{ clipPath: `inset(0 ${100 - analysisResults.successRate.percentage}% 0 0)` }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-white">{analysisResults.successRate.percentage}%</span>
                          </div>
                        </div>
                        <p className="text-center text-white/70">{analysisResults.successRate.message}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Competitors */}
                  {analysisResults?.competitors && (
                    <div className="vision-card p-6 flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-4">Market Competitors</h3>
                      <div className="flex-1">
                        {analysisResults.competitors.competitors.map((competitor: any, index: number) => (
                          <div key={index} className="mb-3">
                            <div className="flex justify-between mb-1">
                              <span className="text-white/80">{competitor.name}</span>
                              <span className="text-white font-medium">{competitor.marketShare}%</span>
                            </div>
                            <div className="vision-progress">
                              <div 
                                className="vision-progress-bar" 
                                style={{ width: `${competitor.marketShare}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                        <p className="text-white/70 text-sm mt-4">{analysisResults.competitors.message}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Market Viability */}
                  {analysisResults?.marketViability && (
                    <div className="vision-card p-6 flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-4">Market Viability</h3>
                      <div className="flex-1">
                        {analysisResults.marketViability.points.map((point: any, index: number) => (
                          <div key={index} className="mb-4 last:mb-0">
                            <div className="flex items-start">
                              <div className={`w-3 h-3 rounded-full mt-1 mr-3 ${
                                point.type === 'success' ? 'bg-green-500' : 
                                point.type === 'warning' ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}></div>
                              <div>
                                <h4 className="text-white font-medium">{point.title}</h4>
                                <p className="text-white/70 text-sm">{point.subtitle}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Unique Value Proposition */}
                  {analysisResults?.uniqueValueProposition && (
                    <div className="vision-card p-6 flex flex-col col-span-1 md:col-span-2">
                      <h3 className="text-lg font-bold text-white mb-4">Unique Value Proposition</h3>
                      <div className="flex-1">
                        <p className="mb-4 text-white/80 italic">{analysisResults.uniqueValueProposition.differentiator}</p>
                        <h4 className="text-white font-medium mb-2">Key Strengths:</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {analysisResults.uniqueValueProposition.strengths.map((strength: string, index: number) => (
                            <li key={index} className="flex items-center text-white/70">
                              <div className="w-2 h-2 rounded-full bg-vision-purple-700 mr-2"></div>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* CAGR Analysis */}
                  {analysisResults?.cagr && (
                    <div className="vision-card p-6 flex flex-col col-span-1 md:col-span-3">
                      <h3 className="text-lg font-bold text-white mb-2">Growth Projection (CAGR)</h3>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-vision-purple-700 mr-2"></div>
                          <span className="text-white/70 mr-6">Your Potential: {analysisResults.cagr.potential}%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-white/70">Industry Average: {analysisResults.cagr.industryAverage}%</span>
                        </div>
                      </div>
                      <div className="h-64 w-full">
                        {/* This would be a chart in a real implementation */}
                        <div className="h-full w-full bg-vision-purple-100/10 rounded-lg p-4 flex items-end">
                          {analysisResults.cagr.data.years.map((year: string, index: number) => (
                            <div key={index} className="flex-1 flex flex-col items-center h-full">
                              <div className="flex-1 w-full flex items-end justify-center space-x-2">
                                <div 
                                  className="w-3 bg-blue-500 rounded-t-sm" 
                                  style={{ 
                                    height: `${(analysisResults.cagr.data.industryAverageData[index] / 
                                      Math.max(...analysisResults.cagr.data.potentialData)) * 100}%` 
                                  }}
                                ></div>
                                <div 
                                  className="w-3 bg-vision-purple-700 rounded-t-sm" 
                                  style={{ 
                                    height: `${(analysisResults.cagr.data.potentialData[index] / 
                                      Math.max(...analysisResults.cagr.data.potentialData)) * 100}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-white/60 text-xs mt-2">{year}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Bottom action buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                  <Button 
                    variant="outline" 
                    className="border-vision-purple-200/20 text-white hover:bg-vision-purple-100/10 w-full sm:w-auto"
                    onClick={() => setAnalysisStep('input')}
                  >
                    Try Another Idea
                  </Button>
                  
                  <div className="flex w-full sm:w-auto">
                    <Button 
                      className="bg-vision-primary-gradient hover:brightness-110 transition-all text-white w-full sm:w-auto"
                    >
                      Get Detailed Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
