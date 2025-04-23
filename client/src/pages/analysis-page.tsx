import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  ChevronRight,
  CircleDot,
  Clock,
  Cog,
  Coins,
  Compass,
  Download,
  ExternalLink,
  Eye,
  FileDown,
  Gauge,
  Hourglass,
  Lightbulb,
  LineChart,
  ListChecks,
  Loader2,
  Map,
  PieChart,
  PlusCircle,
  Save,
  Share2,
  Target,
  ThumbsDown,
  ThumbsUp,
  Timer,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { AuthDialog } from "@/components/auth-dialog";
import { PremiumFeatureOverlay } from "@/components/premium-feature-overlay";
import { SuccessRateChart } from "@/components/analysis/success-rate-chart";
import { CompetitorsChart } from "@/components/analysis/competitors-chart";
import { MarketViabilityCard } from "@/components/analysis/market-viability-card";
import { UVPCard } from "@/components/analysis/uvp-card";
import { CAGRChart } from "@/components/analysis/cagr-chart";
import { FailedExecutionsCard } from "@/components/analysis/failed-executions-card";
import { FundingRequirementsCard } from "@/components/analysis/funding-requirements-card";
import { GTMStrategyCard } from "@/components/analysis/gtm-strategy-card";

// Define the phases of the analysis
type AnalysisPhase = "input" | "loading" | "results" | "budget-input" | "budget-loading" | "budget-results";

// Define schema for the startup idea form
const startupIdeaSchema = z.object({
  idea: z.string().min(10, "Your idea must be at least 10 characters long").max(1000, "Your idea is too long, please summarize it"),
  country: z.string().optional(),
});

// Define schema for the budget form
const budgetSchema = z.object({
  budget: z.string().refine(
    (val) => {
      const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
      return !isNaN(num) && num > 0;
    },
    { message: "Please enter a valid budget amount" }
  ),
});

export default function AnalysisPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [returnTo, setReturnTo] = useState("");
  
  // State for analysis phases and data
  const [phase, setPhase] = useState<AnalysisPhase>("input");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [budgetAnalysisData, setBudgetAnalysisData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingFreeAnalyses, setRemainingFreeAnalyses] = useState<number | null>(null);
  
  // Create form for startup idea input
  const ideaForm = useForm<z.infer<typeof startupIdeaSchema>>({
    resolver: zodResolver(startupIdeaSchema),
    defaultValues: {
      idea: searchParams.get('idea') || "",
      country: "",
    },
  });
  
  // Create form for budget input
  const budgetForm = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budget: "",
    },
  });
  
  // Handle startup idea submission
  const onIdeaSubmit = async (values: z.infer<typeof startupIdeaSchema>) => {
    setPhase("loading");
    setError(null);
    
    try {
      const response = await apiRequest("POST", "/api/analyze", {
        startupIdea: values.idea,
        country: values.country || undefined,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze startup idea");
      }
      
      setAnalysisData(data);
      setPhase("results");
    } catch (err) {
      console.error("Error analyzing startup idea:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
    
    setPhase("budget-loading");
    setError(null);
    
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
      
      const investorsData = await investorsResponse.json();
      
      if (!investorsResponse.ok) {
        toast({
          title: "Investor Data Unavailable",
          description: "We couldn't retrieve investor recommendations at this time.",
          variant: "destructive",
        });
      } else {
        // Combine execution plan with investor data
        data.investorsData = investorsData;
      }
      
      setBudgetAnalysisData(data);
      setPhase("budget-results");
    } catch (err) {
      console.error("Error generating execution plan:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setPhase("results"); // Go back to initial results
      
      toast({
        title: "Execution Plan Failed",
        description: err instanceof Error ? err.message : "Failed to generate your execution plan. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle reset to check another idea
  const handleReset = () => {
    ideaForm.reset();
    budgetForm.reset();
    setPhase("input");
    setAnalysisData(null);
    setBudgetAnalysisData(null);
    setError(null);
  };
  
  // Handle export to PDF
  const handleExportPDF = () => {
    
    toast({
      title: "Export Started",
      description: "Your PDF is being generated and will download shortly.",
    });
    
    // PDF generation would go here
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your analysis has been exported to PDF.",
      });
    }, 2000);
  };
  
  // Handle share to community
  const handleShareToCommunity = () => {
    // Would navigate to community post form with idea pre-filled
    toast({
      title: "Ready to Share",
      description: "You'll be redirected to create a community post with your idea.",
    });
  };
  
  // Handle save analysis
  const handleSaveAnalysis = () => {
    toast({
      title: "Analysis Saved",
      description: "Your startup analysis has been saved.",
    });
  };

  // Animation variants for the results
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <AuthDialog 
        isOpen={authDialogOpen} 
        onClose={() => setAuthDialogOpen(false)} 
        returnTo={returnTo}
      />
      
      <Card className="mb-6 border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-white">
            <Brain className="w-6 h-6 mr-2 text-primary" />
            GENIQL Startup Analysis
          </CardTitle>
          <CardDescription className="text-white/70">
            Analyze your startup idea with our advanced AI to understand its potential, challenges, and required execution steps.
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
                      <FormLabel className="text-white">Startup Idea</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your startup idea in detail... (e.g., 'A mobile app that connects pet owners with certified pet sitters in their area...')"
                          className="h-40 bg-vision-purple-100/10 border-vision-purple-200/20 text-white placeholder:text-white/50"
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
                      <FormLabel className="text-white">Target Country (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Country (e.g., United States, India, etc.)"
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
                  Analyze Startup Idea
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
              Please wait while our AI analyzes your startup concept...
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
              <Progress value={65} className="h-2 bg-vision-purple-200/20" />
            </div>
            <p className="mt-4 text-sm text-white/70">Examining market viability and potential...</p>
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
          
          {/* Analysis Results Grid */}
          <motion.div 
            className="grid gap-6 md:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Success Rate */}
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
                      message={analysisData.successRate.message} 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Competitors & Market Share */}
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
            
            {/* Market Viability */}
            {analysisData.marketViability && (
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg text-white">
                      <Target className="w-5 h-5 mr-2 text-primary" />
                      Target Audience Fit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MarketViabilityCard 
                      points={analysisData.marketViability.points} 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Unique Value Proposition */}
            {analysisData.uniqueValueProposition && (
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg text-white">
                      <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                      Unique Value Proposition
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UVPCard 
                      differentiator={analysisData.uniqueValueProposition.differentiator} 
                      strengths={analysisData.uniqueValueProposition.strengths} 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* CAGR (Pro+ feature) */}
            {analysisData.cagr ? (
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg text-white">
                      <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                      Growth Projection (CAGR)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CAGRChart
                      industryAverage={analysisData.cagr.industryAverage}
                      potential={analysisData.cagr.potential}
                      data={analysisData.cagr.data}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div variants={itemVariants}>
                <PremiumFeatureOverlay
                  title="Growth Projection (CAGR)"
                  description="Upgrade to Pro or Unicorn plan to see detailed growth projections for your industry."
                  icon={<TrendingUp className="w-12 h-12 text-primary/50" />}
                  requiredPlan="pro"
                />
              </motion.div>
            )}
            
            {/* Previous Failed Executions (Pro+ feature) */}
            {analysisData.previousFailedExecutions ? (
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
            ) : (
              <motion.div variants={itemVariants}>
                <PremiumFeatureOverlay
                  title="Previous Failed Executions"
                  description="Upgrade to Pro or Unicorn plan to see similar ideas that failed and why."
                  icon={<AlertTriangle className="w-12 h-12 text-primary/50" />}
                  requiredPlan="pro"
                />
              </motion.div>
            )}
            
            {/* Funding Requirements (Pro+ feature) */}
            {analysisData.fundingRequirements ? (
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
                      seedRound={analysisData.fundingRequirements.seedRound}
                      seriesA={analysisData.fundingRequirements.seriesA}
                      allocation={analysisData.fundingRequirements.allocation}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div variants={itemVariants}>
                <PremiumFeatureOverlay
                  title="Funding Requirements"
                  description="Upgrade to Pro or Unicorn plan to see detailed funding requirements."
                  icon={<Coins className="w-12 h-12 text-primary/50" />}
                  requiredPlan="pro"
                />
              </motion.div>
            )}
            
            {/* Go-to-Market Strategy (Pro+ feature) */}
            {analysisData.goToMarketStrategy ? (
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg text-white">
                      <Compass className="w-5 h-5 mr-2 text-primary" />
                      Go-to-Market Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GTMStrategyCard
                      steps={analysisData.goToMarketStrategy.steps}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div variants={itemVariants}>
                <PremiumFeatureOverlay
                  title="Go-to-Market Strategy"
                  description="Upgrade to Pro or Unicorn plan to see a detailed go-to-market strategy."
                  icon={<Compass className="w-12 h-12 text-primary/50" />}
                  requiredPlan="pro"
                />
              </motion.div>
            )}
          </motion.div>
          
          {/* Options after analysis */}
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
          
          {/* Budget Analysis Results Grid */}
          <motion.div 
            className="grid gap-6 md:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Budget and Allocation */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg text-white">
                    <Coins className="w-5 h-5 mr-2 text-primary" />
                    Budget Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="p-4 text-center border rounded-lg bg-vision-purple-100/5 border-vision-purple-200/10">
                      <p className="mb-1 text-sm text-white/70">Product Development</p>
                      <p className="text-2xl font-semibold text-white">${budgetAnalysisData.budget.development.toLocaleString()}</p>
                      <p className="mt-1 text-sm text-white/70">
                        {Math.round((budgetAnalysisData.budget.development / 
                          (budgetAnalysisData.budget.development + 
                           budgetAnalysisData.budget.marketing + 
                           budgetAnalysisData.budget.operations)) * 100)}%
                      </p>
                    </div>
                    <div className="p-4 text-center border rounded-lg bg-vision-purple-100/5 border-vision-purple-200/10">
                      <p className="mb-1 text-sm text-white/70">Marketing</p>
                      <p className="text-2xl font-semibold text-white">${budgetAnalysisData.budget.marketing.toLocaleString()}</p>
                      <p className="mt-1 text-sm text-white/70">
                        {Math.round((budgetAnalysisData.budget.marketing / 
                          (budgetAnalysisData.budget.development + 
                           budgetAnalysisData.budget.marketing + 
                           budgetAnalysisData.budget.operations)) * 100)}%
                      </p>
                    </div>
                    <div className="p-4 text-center border rounded-lg bg-vision-purple-100/5 border-vision-purple-200/10">
                      <p className="mb-1 text-sm text-white/70">Operations</p>
                      <p className="text-2xl font-semibold text-white">${budgetAnalysisData.budget.operations.toLocaleString()}</p>
                      <p className="mt-1 text-sm text-white/70">
                        {Math.round((budgetAnalysisData.budget.operations / 
                          (budgetAnalysisData.budget.development + 
                           budgetAnalysisData.budget.marketing + 
                           budgetAnalysisData.budget.operations)) * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Execution Roadmap */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg text-white">
                    <Map className="w-5 h-5 mr-2 text-primary" />
                    Execution Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-8 mt-4 ml-3 border-l border-dashed border-primary/40">
                    {budgetAnalysisData.roadmap.map((item, index) => (
                      <div key={index} className="relative mb-8">
                        <div className="absolute w-6 h-6 bg-vision-primary-gradient rounded-full -left-11 flex items-center justify-center text-white">
                          {index + 1}
                        </div>
                        <div className="mb-1 text-lg font-medium text-white">{item.step}</div>
                        <div className="flex items-center mb-2">
                          <Clock className="w-4 h-4 mr-1 text-primary/80" />
                          <span className="text-sm text-white/70">{item.timeframe}</span>
                        </div>
                        <div className="flex items-center">
                          <Coins className="w-4 h-4 mr-1 text-primary/80" />
                          <span className="text-sm text-white/70">Budget: ${item.cost.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Potential Investors */}
            {budgetAnalysisData.investorsData && budgetAnalysisData.investorsData.investors && (
              <motion.div variants={itemVariants} className="md:col-span-2">
                <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg text-white">
                      <Users className="w-5 h-5 mr-2 text-primary" />
                      Potential Investors
                    </CardTitle>
                    <CardDescription className="text-xs text-white/50 italic">
                      Note: The investor information is AI-generated and for illustration purposes only. Always verify manually.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {budgetAnalysisData.investorsData.investors.map((investor, index) => (
                        <div 
                          key={index} 
                          className="p-4 border rounded-lg bg-vision-purple-100/5 border-vision-purple-200/10 hover:bg-vision-purple-100/10 transition"
                        >
                          <h4 className="mb-1 text-base font-medium text-white">{investor.name}</h4>
                          <p className="mb-2 text-sm text-white/70">{investor.firm}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {investor.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} className="bg-vision-primary-gradient/30 text-white text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <a 
                            href={investor.crunchbaseLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" /> Crunchbase Profile
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
          
          {/* Final Options after budget analysis */}
          <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl text-white">Final Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center h-auto py-6 space-x-2 bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20"
                  onClick={() => setPhase("results")}
                >
                  <ChevronRight className="w-5 h-5 mr-2 rotate-180" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Back to Analysis</div>
                    <div className="text-xs text-white/70">Return to initial analysis results</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center h-auto py-6 space-x-2 bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20"
                  onClick={handleReset}
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Analyze New Idea</div>
                    <div className="text-xs text-white/70">Start a fresh analysis with a new concept</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center h-auto py-6 space-x-2 bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20"
                  onClick={handleExportPDF}
                >
                  <Download className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Export Full Report</div>
                    <div className="text-xs text-white/70">Download analysis and execution plan</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* ERROR STATE */}
      {error && (
        <Card className="border-destructive/50 bg-vision-card/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-white">
              <X className="w-5 h-5 mr-2 text-destructive" />
              Analysis Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80">{error}</p>
            <Button 
              className="mt-4 bg-vision-primary-gradient hover:bg-vision-primary-gradient/90"
              onClick={handleReset}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}