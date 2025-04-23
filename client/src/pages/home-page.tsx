import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { detectUserCountry } from "@/lib/utils";
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
  const { openAuthDialog } = useAuthDialog();
  const { toast } = useToast();
  const [startupIdea, setStartupIdea] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [remainingFreeAnalyses, setRemainingFreeAnalyses] = useState<number | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [analysisStep, setAnalysisStep] = useState<'input' | 'results'>('input');

  const handleAnalyze = async () => {
    if (!startupIdea.trim() || isAnalyzing) return;

    setIsAnalyzing(true);

    try {
      // Check remaining free analyses first for non-logged in users
      if (!user) {
        const checkResponse = await fetch('/api/check-free-analyses');
        if (checkResponse.ok) {
          const data = await checkResponse.json();
          if (data.remainingFreeAnalyses <= 0) {
            setIsAnalyzing(false);
            openAuthDialog({
              defaultTab: 'register',
              returnTo: '/'
            });

            toast({
              title: "Free Analysis Limit Reached",
              description: "Sign up to continue analyzing startup ideas and unlock more features!",
              variant: "default",
            });
            return;
          }
          setRemainingFreeAnalyses(data.remainingFreeAnalyses);
        }
      }

      // Store the startup idea in sessionStorage for the analysis page
      sessionStorage.setItem('pendingStartupIdea', startupIdea);
      sessionStorage.setItem('userCountry', detectUserCountry());
      
      // Redirect to the analysis page
      navigate('/analysis');
      
    } catch (error) {
      console.error("Error preparing analysis:", error);
      
      toast({
        title: "Error",
        description: "We couldn't process your request at this moment. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-vision-bg flex">
      <div className="flex-1 flex flex-col main-content transition-all duration-300">
        <main className="flex-grow flex items-center justify-center overflow-hidden relative px-6 py-12">
          {analysisStep === 'input' ? (
            <div className="w-full max-w-3xl text-center">
              <h1 className="text-4xl font-bold text-white mb-8">What's your idea?</h1>
              <div className="mb-6">
                <label htmlFor="startup-idea" className="block text-white/90 font-medium mb-2">
                  Describe your startup idea in detail
                </label>
                <Textarea
                  id="startup-idea"
                  value={startupIdea}
                  onChange={(e) => setStartupIdea(e.target.value)}
                  placeholder="Example: A subscription service that delivers personalized book recommendations based on AI analysis of reading preferences and behavior..."
                  className="h-32 bg-vision-card/80 border-vision-purple-200/20 text-white placeholder:text-white/40 focus:border-vision-purple-500"
                />

                {!user && (
                  <div className="mt-2 text-sm text-white/60 flex items-center">
                    {remainingFreeAnalyses !== null ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-1 text-vision-purple-500" />
                        <span>
                          {remainingFreeAnalyses === 2 ? (
                            "You have 2 free analyses available - no signup required!"
                          ) : remainingFreeAnalyses === 1 ? (
                            "You have 1 free analysis remaining before signup is required."
                          ) : (
                            "You've used all free analyses. Sign up to continue!"
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-1 text-vision-purple-500" />
                        <span>Try 2 free analyses without signup!</span>
                      </>
                    )}
                  </div>
                )}
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
          ) : (
            <div className="w-full max-w-7xl">
              <div className="flex flex-col space-y-6">
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

                {analysisResults && (
                  <>
                    <div className="vision-card p-6">
                      <h2 className="text-xl font-bold text-white mb-2">Analysis Results</h2>
                      <pre className="text-white/80">{JSON.stringify(analysisResults, null, 2)}</pre>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}