import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  ChevronRight,
  Cog,
  Coins,
  Compass,
  Eye,
  FileDown,
  Gauge,
  LineChart,
  PieChart,
  PlusCircle,
  Save,
  Share2,
  Target,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";

import { AuthDialog } from "@/components/auth-dialog";
import { SuccessRateChart } from "@/components/analysis/success-rate-chart";
import { CompetitorsChart } from "@/components/analysis/competitors-chart";
import { FundingRequirementsCard } from "@/components/analysis/funding-requirements-card";
import { FailedExecutionsCard } from "@/components/analysis/failed-executions-card";
import { FeasibilityScalability } from "@/components/analysis/feasibility-scalability";
import { RiskAnalysis } from "@/components/analysis/risk-analysis";
import { GoToMarketStrategy } from "@/components/analysis/go-to-market-strategy";
import { LongTermVision } from "@/components/analysis/long-term-vision";
import { TeamExecution } from "@/components/analysis/team-execution";
import { FundingInvestors } from "@/components/analysis/funding-investors";
import { MarketSizeChart } from "@/components/analysis/market-size-chart";
import { BusinessModelStrengthChart } from "@/components/analysis/business-model-strength";
import { SWOTAnalysis } from "@/components/analysis/swot-analysis";

// Define component prop interfaces
interface FeasibilityAndScalabilityProps {
  initialFeasibility: number;
  scalingPoints: Array<{
    milestone: string;
    investment: number;
    potentialReturns: number;
    feasibilityScore: number;
  }>;
  message: string;
}

interface RiskAnalysisProps {
  overallRisk: number;
  risks: Array<{
    category: string;
    likelihood: number;
    impact: number;
    mitigationStrategy: string;
  }>;
  message: string;
}

interface GoToMarketStrategyProps {
  timeline: Array<{
    phase: string;
    duration: string;
    activities: string[];
    estimatedCost: number;
  }>;
  message: string;
}

interface LongTermVisionProps {
  milestones: Array<{
    year: string;
    goals: string[];
    projectedMetrics: {
      revenue?: number;
      users?: number;
      marketShare?: number;
    };
  }>;
  message: string;
}

interface TeamExecutionProps {
  requiredRoles: Array<{
    title: string;
    skills: string[];
    importance: number;
    estimatedCost: number;
  }>;
  hiringTimeline: string;
  message: string;
}

interface FundingInvestorsProps {
  investors: Array<{
    name: string;
    firm: string;
    investmentFocus: string[];
    location: string;
    contactInfo?: string;
    portfolioFit: number;
  }>;
  message: string;
}

// Define the phases of the analysis process
type AnalysisPhase = 
  | "input"        // Initial idea input
  | "loading"      // Processing analysis
  | "results"      // Showing analysis results
  | "budget-input" // Budget entry
  | "budget-loading" // Processing budget analysis
  | "budget-results"; // Showing budget-based results

// Schema for validating startup idea form
const startupIdeaSchema = z.object({
  idea: z.string()
    .min(10, "Your idea must be at least 10 characters long")
    .max(1000, "Your idea is too long, please summarize it"),
  country: z.string().optional(),
});

// Schema for validating budget form
const budgetSchema = z.object({
  budget: z.string().refine(
    (val) => {
      const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
      return !isNaN(num) && num > 0;
    },
    { message: "Please enter a valid budget amount" }
  ),
});

// Animation variants for the results grid
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function AnalysisPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.search.toString());
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [returnTo, setReturnTo] = useState("");
  
  // State management
  const [phase, setPhase] = useState<AnalysisPhase>("input");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [budgetAnalysisData, setBudgetAnalysisData] = useState<any>(null);
  const [remainingFreeAnalyses, setRemainingFreeAnalyses] = useState<number | null>(null);
  const [relatedIdeasData, setRelatedIdeasData] = useState<any[]>([]);
  
  // Forms setup
  const ideaForm = useForm<z.infer<typeof startupIdeaSchema>>({
    resolver: zodResolver(startupIdeaSchema),
    defaultValues: {
      idea: searchParams.get('idea') || "",
      country: "",
    },
  });
  
  const budgetForm = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budget: "",
    },
  });
  
  // Handle startup idea submission
  const onIdeaSubmit = async (values: z.infer<typeof startupIdeaSchema>) => {
    setPhase("loading");
    
    try {
      const response = await apiRequest("POST", "/api/analyze", {
        startupIdea: values.idea,
        country: values.country || undefined,
      });
      
      const data = await response.json();
      
      if (response.status === 403 && data.error === "free_limit_reached") {
        // Show auth dialog if free limit is reached
        setReturnTo(window.location.pathname + (values.idea ? `?idea=${encodeURIComponent(values.idea)}` : ""));
        setAuthDialogOpen(true);
        setPhase("input");
        return;
      }
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze startup idea");
      }
      
      // Set remaining free analyses for anonymous users
      if (data.meta && data.meta.remainingFreeAnalyses !== null) {
        setRemainingFreeAnalyses(data.meta.remainingFreeAnalyses);
      }
      
      // Store related ideas separately
      if (data.relatedIdeas && data.relatedIdeas.length > 0) {
        setRelatedIdeasData(data.relatedIdeas);
      }
      
      setAnalysisData(data);
      setPhase("results");
    } catch (err: any) {
      console.error("Error analyzing startup idea:", err);
      setPhase("input");
      
      toast({
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : "Failed to analyze your startup idea. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle budget submission
  const onBudgetSubmit = async (values: z.infer<typeof budgetSchema>) => {
    if (!user) {
      setReturnTo(window.location.pathname);
      setAuthDialogOpen(true);
      return;
    }
    
    // Premium plan check
    if (user.planType !== "unicorn") {
      toast({
        title: "Unicorn Plan Required",
        description: "This feature is only available to users on the Unicorn plan. Please upgrade to unlock it.",
        variant: "destructive",
      });
      return;
    }
    
    setPhase("budget-loading");
    
    try {
      const budgetValue = parseFloat(values.budget.replace(/[^0-9.-]+/g, ""));
      
      const response = await apiRequest("POST", "/api/execution-plan", {
        startupIdea: ideaForm.getValues().idea,
        initialBudget: budgetValue,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to generate execution plan");
      }
      
      // Also get investor recommendations
      const investorsResponse = await apiRequest("POST", "/api/investors", {
        startupIdea: ideaForm.getValues().idea,
      });
      
      if (investorsResponse.ok) {
        const investorsData = await investorsResponse.json();
        data.investorsData = investorsData;
      }
      
      setBudgetAnalysisData(data);
      setPhase("budget-results");
    } catch (err: any) {
      console.error("Error generating execution plan:", err);
      setPhase("results"); // Go back to initial results
      
      toast({
        title: "Execution Plan Failed",
        description: err instanceof Error ? err.message : "Failed to generate your execution plan. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Action handlers
  const handleReset = () => {
    ideaForm.reset();
    budgetForm.reset();
    setPhase("input");
    setAnalysisData(null);
    setBudgetAnalysisData(null);
    setRelatedIdeasData([]);
  };
  
  const handleExportPDF = () => {
    if (!user) {
      setReturnTo(window.location.pathname);
      setAuthDialogOpen(true);
      return;
    }
    
    if (user.planType === "free") {
      toast({
        title: "Pro Plan Required",
        description: "Exporting to PDF is a premium feature. Please upgrade to Pro or Unicorn plan to use it.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Export Started",
      description: "Your PDF is being generated and will download shortly.",
    });
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your analysis has been exported to PDF.",
      });
    }, 2000);
  };
  
  const handleShareToCommunity = () => {
    if (!user) {
      setReturnTo(window.location.pathname);
      setAuthDialogOpen(true);
      return;
    }
    
    toast({
      title: "Ready to Share",
      description: "You'll be redirected to create a community post with your idea.",
    });
  };
  
  const handleSaveAnalysis = () => {
    if (!user) {
      setReturnTo(window.location.pathname);
      setAuthDialogOpen(true);
      return;
    }
    
    toast({
      title: "Analysis Saved",
      description: "Your startup analysis has been saved to your account.",
    });
  };

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <AuthDialog 
        isOpen={authDialogOpen} 
        onClose={() => setAuthDialogOpen(false)} 
        returnTo={returnTo}
      />
      
      {/* Header */}
      <Card className="mb-6 border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-white">
            <Brain className="w-6 h-6 mr-2 text-primary" />
            GENIQL Startup Analysis
          </CardTitle>
          <CardDescription className="text-white/70">
            Analyze your startup idea with our advanced AI to understand its potential, challenges, and execution requirements.
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* IDEA INPUT PHASE */}
      {phase === "input" && (
        <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-white">Enter Your Startup Idea</CardTitle>
            <CardDescription className="text-white/70">
              Provide a detailed description of your startup idea for comprehensive analysis
              {!user && remainingFreeAnalyses !== null && (
                <span className="block mt-2 font-medium">
                  You have {remainingFreeAnalyses} free analyses remaining
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...ideaForm}>
              <form onSubmit={ideaForm.handleSubmit(onIdeaSubmit)} className="space-y-6">
                <FormField
                  control={ideaForm.control}
                  name="idea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Your Startup Idea</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your startup idea in detail..."
                          className="min-h-32 bg-vision-purple-100/10 border-vision-purple-200/20 text-white placeholder:text-white/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={ideaForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Target Market (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. United States, Global, etc."
                          className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white placeholder:text-white/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-vision-primary-gradient hover:bg-vision-primary-gradient/90"
                >
                  Analyze My Idea
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {/* LOADING STATE */}
      {phase === "loading" && (
        <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-white">Analyzing Your Startup Idea</CardTitle>
            <CardDescription className="text-white/70">
              Please wait while our AI evaluates your idea's potential...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="relative w-24 h-24">
              <div className="absolute w-full h-full rounded-full opacity-20 bg-primary animate-ping"></div>
              <div className="relative flex items-center justify-center w-full h-full bg-vision-card rounded-full border border-primary">
                <Brain className="w-12 h-12 text-primary animate-pulse" />
              </div>
            </div>
            <div className="w-64 mt-8">
              <Progress value={45} className="h-2 bg-vision-purple-200/20" />
            </div>
            <p className="mt-4 text-sm text-white/70">Performing comprehensive market analysis...</p>
          </CardContent>
        </Card>
      )}
      
      {/* RESULTS PHASE */}
      {phase === "results" && analysisData && (
        <div className="space-y-6">
          {/* Result Header */}
          <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Analysis Results
              </CardTitle>
              <CardDescription className="text-white/70">
                Here's our AI-powered analysis of your startup idea
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg bg-vision-purple-100/5 border-vision-purple-200/10">
                <h3 className="mb-2 text-lg font-medium text-white">Your Idea</h3>
                <p className="text-white/80">{ideaForm.getValues().idea}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* The 8 Analysis Blocks Grid */}
          <motion.div 
            className="grid gap-6 md:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* 1. Success Rate */}
            {analysisData.successRate && (
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg text-white">
                      <Gauge className="w-5 h-5 mr-2 text-primary" />
                      Success Rate Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SuccessRateChart 
                      percentage={analysisData.successRate.percentage}
                      goodPoints={analysisData.successRate.goodPoints}
                      badPoints={analysisData.successRate.badPoints}
                      message={analysisData.successRate.message}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* 2. Competitors & Market Share */}
            {analysisData.competitors && (
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg text-white">
                      <Users className="w-5 h-5 mr-2 text-primary" />
                      Competitors & Market Share
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CompetitorsChart 
                      competitors={analysisData.competitors.competitors} 
                      message={analysisData.competitors.message} 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* 3. Target Audience Fit */}
            {analysisData.targetAudienceFit && (
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg text-white">
                      <Target className="w-5 h-5 mr-2 text-primary" />
                      Target Audience Fit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-64">
                        {/* Radar chart will go here */}
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="p-4 text-center border rounded-lg bg-vision-purple-100/5 border-vision-purple-200/10">
                            <p className="text-white/80">{analysisData.targetAudienceFit.message}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {analysisData.targetAudienceFit.segments.map((segment: {name: string, score: number}, i: number) => (
                          <div key={i} className="p-3 border rounded-lg bg-vision-purple-100/5 border-vision-purple-200/10">
                            <p className="text-sm font-medium text-white">{segment.name}</p>
                            <div className="flex items-center mt-2">
                              <div className="flex-1 h-2 mr-2 rounded-full bg-vision-purple-200/20">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${segment.score}%` }}></div>
                              </div>
                              <span className="text-xs text-white/70">{segment.score}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* 4. Market Size */}
            {analysisData.marketSize && (
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg text-white">
                      <PieChart className="w-5 h-5 mr-2 text-primary" />
                      Market Size Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MarketSizeChart 
                      segments={analysisData.marketSize.segments}
                      totalSize={analysisData.marketSize.totalSize}
                      message={analysisData.marketSize.message}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* 5. Business Model Strength */}
            {analysisData.businessModelStrength && (
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg text-white">
                      <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                      Business Model Strength
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BusinessModelStrengthChart 
                      overall={analysisData.businessModelStrength.overall}
                      components={analysisData.businessModelStrength.components}
                      message={analysisData.businessModelStrength.message}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* 6. Funding Requirements */}
            {analysisData.fundingRequired && (
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg text-white">
                      <Coins className="w-5 h-5 mr-2 text-primary" />
                      Funding Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FundingRequirementsCard 
                      total={analysisData.fundingRequired.total}
                      breakdown={analysisData.fundingRequired.breakdown}
                      message={analysisData.fundingRequired.message}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* 7. SWOT Analysis */}
            {analysisData.swotAnalysis && (
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg text-white">
                      <Activity className="w-5 h-5 mr-2 text-primary" />
                      SWOT Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SWOTAnalysis 
                      strengths={analysisData.swotAnalysis.strengths}
                      weaknesses={analysisData.swotAnalysis.weaknesses}
                      opportunities={analysisData.swotAnalysis.opportunities}
                      threats={analysisData.swotAnalysis.threats}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* 8. Previous Failed Executions */}
            {analysisData.previousFailedExecutions && (
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg text-white">
                      <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
                      Previous Failed Executions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FailedExecutionsCard
                      failures={analysisData.previousFailedExecutions.failures}
                      message={analysisData.previousFailedExecutions.message}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
          
          {/* Related Ideas Section */}
          {relatedIdeasData.length > 0 && (
            <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl text-white">Related Ideas</CardTitle>
                <CardDescription className="text-white/70">
                  You might also be interested in these similar startup concepts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {relatedIdeasData.slice(0, 3).map((idea, index) => (
                    <Card key={index} className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md text-white flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/20 text-primary mr-2">
                            {index + 1}
                          </div>
                          {idea.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-white/70 mb-3">{idea.description}</p>
                        <div className="flex items-center">
                          <span className="text-xs text-white/50 mr-2">Potential Score:</span>
                          <div className="h-2 flex-1 rounded-full bg-vision-purple-200/20">
                            <div 
                              className="h-2 rounded-full bg-primary" 
                              style={{ width: `${idea.potentialScore}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-white/80 ml-2">{idea.potentialScore}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Three Option Buttons */}
          <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl text-white">What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center h-auto py-6 space-x-2 bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20"
                  onClick={handleReset}
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Check Another Idea</div>
                    <div className="text-xs text-white/70">Analyze a different startup concept</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center h-auto py-6 space-x-2 bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20"
                  onClick={() => setPhase("budget-input")}
                >
                  <Coins className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Plan to Execute</div>
                    <div className="text-xs text-white/70">Get detailed execution plan based on budget</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center h-auto py-6 space-x-2 bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20"
                  onClick={handleShareToCommunity}
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Share to Community</div>
                    <div className="text-xs text-white/70">Get feedback from other entrepreneurs</div>
                  </div>
                </Button>
              </div>
              
              {/* Additional Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 justify-end">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-vision-purple-200/10"
                  onClick={handleSaveAnalysis}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Analysis
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-vision-purple-200/10"
                  onClick={handleExportPDF}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* BUDGET INPUT PHASE */}
      {phase === "budget-input" && (
        <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-white">Plan Your Execution Budget</CardTitle>
            <CardDescription className="text-white/70">
              Enter your available budget to get a detailed execution plan
              {!user?.planType || user.planType !== "unicorn" ? (
                <span className="block mt-2 font-medium text-amber-400">
                  This is a Unicorn-only feature. You'll need to upgrade your plan.
                </span>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...budgetForm}>
              <form onSubmit={budgetForm.handleSubmit(onBudgetSubmit)} className="space-y-6">
                <FormField
                  control={budgetForm.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Initial Budget</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="$10,000"
                          className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white placeholder:text-white/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1 bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20"
                    onClick={() => setPhase("results")}
                  >
                    Back to Results
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-vision-primary-gradient hover:bg-vision-primary-gradient/90"
                  >
                    Get Execution Plan
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {/* BUDGET LOADING STATE */}
      {phase === "budget-loading" && (
        <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-white">Creating Your Execution Plan</CardTitle>
            <CardDescription className="text-white/70">
              Please wait while our AI generates a detailed execution strategy...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="relative w-24 h-24">
              <div className="absolute w-full h-full rounded-full opacity-20 bg-primary animate-ping"></div>
              <div className="relative flex items-center justify-center w-full h-full bg-vision-card rounded-full border border-primary">
                <Cog className="w-12 h-12 text-primary animate-spin" />
              </div>
            </div>
            <div className="w-64 mt-8">
              <Progress value={75} className="h-2 bg-vision-purple-200/20" />
            </div>
            <p className="mt-4 text-sm text-white/70">Building a comprehensive execution roadmap...</p>
          </CardContent>
        </Card>
      )}
      
      {/* BUDGET RESULTS PHASE */}
      {phase === "budget-results" && budgetAnalysisData && (
        <div className="space-y-6">
          {/* Budget Result Header */}
          <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Execution Plan for Your Startup
              </CardTitle>
              <CardDescription className="text-white/70">
                Detailed strategy based on your budget of ${budgetForm.getValues().budget}
              </CardDescription>
            </CardHeader>
          </Card>
          
          {/* 6 Budget Analysis Results Blocks */}
          <motion.div 
            className="grid gap-6 md:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* 1. Feasibility and Scalability */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg text-white">
                    <LineChart className="w-5 h-5 mr-2 text-primary" />
                    Feasibility & Scalability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FeasibilityScalability
                    initialFeasibility={budgetAnalysisData.feasibilityAndScalability.initialFeasibility}
                    scalingPoints={budgetAnalysisData.feasibilityAndScalability.scalingPoints}
                    message={budgetAnalysisData.feasibilityAndScalability.message}
                  />
                </CardContent>
              </Card>
            </motion.div>
            
            {/* 2. Risk Analysis */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg text-white">
                    <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
                    Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RiskAnalysis
                    overallRisk={budgetAnalysisData.riskAnalysis.overallRisk}
                    risks={budgetAnalysisData.riskAnalysis.risks}
                    message={budgetAnalysisData.riskAnalysis.message}
                  />
                </CardContent>
              </Card>
            </motion.div>
            
            {/* 3. Go-to-Market Strategy */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg text-white">
                    <Compass className="w-5 h-5 mr-2 text-primary" />
                    Go-to-Market Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GoToMarketStrategy
                    timeline={budgetAnalysisData.goToMarketStrategy.timeline}
                    message={budgetAnalysisData.goToMarketStrategy.message}
                  />
                </CardContent>
              </Card>
            </motion.div>
            
            {/* 4. Long Term Vision */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg text-white">
                    <Eye className="w-5 h-5 mr-2 text-primary" />
                    Long-Term Vision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LongTermVision
                    milestones={budgetAnalysisData.longTermVision.milestones}
                    message={budgetAnalysisData.longTermVision.message}
                  />
                </CardContent>
              </Card>
            </motion.div>
            
            {/* 5. Team Execution Capability */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg text-white">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Team Execution Capability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TeamExecution
                    requiredRoles={budgetAnalysisData.teamExecutionCapability.requiredRoles}
                    hiringTimeline={budgetAnalysisData.teamExecutionCapability.hiringTimeline}
                    message={budgetAnalysisData.teamExecutionCapability.message}
                  />
                </CardContent>
              </Card>
            </motion.div>
            
            {/* 6. Funding & Investment Potential */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg text-white">
                    <Coins className="w-5 h-5 mr-2 text-primary" />
                    Funding & Investment Potential
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FundingInvestors
                    investors={budgetAnalysisData.fundingAndInvestmentPotential.investors}
                    message={budgetAnalysisData.fundingAndInvestmentPotential.message}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          
          {/* Final Three Options */}
          <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl text-white">Take Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center h-auto py-6 space-x-2 bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20"
                  onClick={handleSaveAnalysis}
                >
                  <Save className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Save This Analysis</div>
                    <div className="text-xs text-white/70">Store for future reference</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center h-auto py-6 space-x-2 bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20"
                  onClick={handleExportPDF}
                >
                  <FileDown className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Export Analysis to PDF</div>
                    <div className="text-xs text-white/70">Download complete report</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center h-auto py-6 space-x-2 bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20"
                  onClick={handleShareToCommunity}
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Share to Community</div>
                    <div className="text-xs text-white/70">Get feedback on your idea</div>
                  </div>
                </Button>
              </div>
              
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20"
                  onClick={() => setPhase("results")}
                >
                  <ChevronRight className="w-4 h-4 mr-2 transform rotate-180" />
                  Back to Initial Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}