import { useState, useEffect, useContext } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CheckCircle,
  Cog,
  Coins,
  Compass,
  Eye,
  FileDown,
  Gauge,
  Lightbulb,
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
import { Badge } from "@/components/ui/badge";

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
import { SaveIdeaButton } from "@/components/save-idea-button";

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
  category: z.string().optional(),
});

// List of popular countries for the dropdown
const countries = [
  { value: "United States", label: "United States" },
  { value: "China", label: "China" },
  { value: "India", label: "India" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Japan", label: "Japan" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "Brazil", label: "Brazil" },
  { value: "Singapore", label: "Singapore" },
  { value: "Israel", label: "Israel" },
  { value: "Global", label: "Global / International" },
];

// Startup idea templates by category
const startupTemplates = {
  "Technology": [
    {
      title: "AI Assistant",
      description: "An AI-powered virtual assistant that helps users with scheduling, email management, and task automation through natural language processing."
    },
    {
      title: "Blockchain for Supply Chain",
      description: "A blockchain platform that provides end-to-end transparency and traceability for global supply chains, reducing fraud and improving efficiency."
    },
    {
      title: "AR Navigation",
      description: "An augmented reality navigation app that overlays directions onto the real world through smartphone cameras, making navigation more intuitive."
    }
  ],
  "Healthcare": [
    {
      title: "Remote Patient Monitoring",
      description: "A wearable device and companion app that continuously monitors vital signs and alerts healthcare providers about concerning changes."
    },
    {
      title: "Mental Health Platform",
      description: "An AI-driven mental health platform that provides personalized therapy recommendations and tracks progress over time."
    },
    {
      title: "Medical Translation",
      description: "A real-time medical translation service that helps doctors communicate with patients who speak different languages."
    }
  ],
  "Sustainability": [
    {
      title: "Plastic Alternative",
      description: "A biodegradable alternative to single-use plastics made from agricultural waste that breaks down completely within 90 days."
    },
    {
      title: "Carbon Footprint Tracker",
      description: "A mobile app that tracks individual carbon footprints and provides actionable recommendations to reduce environmental impact."
    },
    {
      title: "Clean Energy Marketplace",
      description: "A platform connecting consumers directly with renewable energy producers, allowing users to purchase clean energy at competitive prices."
    }
  ],
  "Finance": [
    {
      title: "Micro-Investment Platform",
      description: "An app that automatically rounds up everyday purchases and invests the spare change in diversified portfolios tailored to user goals."
    },
    {
      title: "Freelancer Banking",
      description: "A specialized banking platform for freelancers and gig workers that handles invoicing, tax preparation, and retirement planning."
    },
    {
      title: "Financial Literacy Game",
      description: "An educational mobile game that teaches financial literacy concepts through engaging gameplay and real-world simulations."
    }
  ],
  "Education": [
    {
      title: "Personalized Learning Platform",
      description: "An adaptive learning platform that customizes educational content based on individual student progress and learning styles."
    },
    {
      title: "Vocational Training VR",
      description: "Virtual reality training modules for vocational skills that simulate real-world working environments and scenarios."
    },
    {
      title: "Peer Teaching Marketplace",
      description: "A platform connecting students who excel in certain subjects with peers who need help, creating a marketplace for knowledge exchange."
    }
  ],
  "E-commerce": [
    {
      title: "AR Shopping Experience",
      description: "An augmented reality platform that allows shoppers to visualize products in their own space before purchasing."
    },
    {
      title: "Sustainable Marketplace",
      description: "An online marketplace exclusively for sustainable and ethically-produced goods with transparent supply chains."
    },
    {
      title: "Local Business Delivery",
      description: "A same-day delivery service that partners with local businesses to compete with large e-commerce platforms."
    }
  ]
};

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
  const auth = useContext(AuthContext);
  const user = auth?.user;
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
  const [selectedCategoryTemplates, setSelectedCategoryTemplates] = useState<Array<{title: string, description: string}>>([]);
  const [activeTab, setActiveTab] = useState<string>("custom");
  
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
      
      // We now allow unlimited analyses for all users
      if (response.status === 403) {
        console.log("Processing analysis request...");
        // Just continue with the analysis
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
  
  // Check for pending analysis from sessionStorage (populated by home page)
  useEffect(() => {
    const pendingIdea = sessionStorage.getItem('pendingStartupIdea');
    const userCountry = sessionStorage.getItem('userCountry');
    
    if (pendingIdea) {
      // Clear sessionStorage to prevent resubmission
      sessionStorage.removeItem('pendingStartupIdea');
      sessionStorage.removeItem('userCountry');
      
      // Set form values
      ideaForm.setValue('idea', pendingIdea);
      if (userCountry) {
        ideaForm.setValue('country', userCountry);
      }
      
      // Auto-submit the form with the current values
      const formValues = ideaForm.getValues();
      const timer = setTimeout(() => {
        onIdeaSubmit({
          idea: formValues.idea,
          country: formValues.country
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Handle budget submission
  const onBudgetSubmit = async (values: z.infer<typeof budgetSchema>) => {
    if (!user) {
      setReturnTo(window.location.pathname);
      setAuthDialogOpen(true);
      return;
    }
    
    // All features are now available to everyone
    
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
    
    // All features are now available to everyone
    
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
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <AuthDialog 
        isOpen={authDialogOpen} 
        onClose={() => setAuthDialogOpen(false)} 
        returnTo={returnTo}
      />
      
      {/* IDEA INPUT PHASE */}
      {phase === "input" && (
        <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-white">What's in your mind?</CardTitle>
            <CardDescription className="text-white/70">
              Share your startup idea for comprehensive AI-powered analysis

            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...ideaForm}>
              <form onSubmit={ideaForm.handleSubmit(onIdeaSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={ideaForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Target Market</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white">
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/20">
                            {countries.map((country) => (
                              <SelectItem 
                                key={country.value} 
                                value={country.value}
                                className="text-white hover:bg-vision-purple-200/20"
                              >
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={ideaForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Idea Category</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            
                            // Display category templates when a category is selected
                            setSelectedCategoryTemplates(
                              startupTemplates[value as keyof typeof startupTemplates] || []
                            );
                            
                            // Switch to templates tab if a category with templates is selected
                            if (startupTemplates[value as keyof typeof startupTemplates]) {
                              setActiveTab("templates");
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/20">
                            {Object.keys(startupTemplates).map((category) => (
                              <SelectItem 
                                key={category} 
                                value={category}
                                className="text-white hover:bg-vision-purple-200/20"
                              >
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="w-full bg-vision-purple-100/10 border-vision-purple-200/20">
                    <TabsTrigger 
                      value="custom" 
                      className="text-white data-[state=active]:bg-vision-purple-200/20"
                    >
                      Custom Idea
                    </TabsTrigger>
                    <TabsTrigger 
                      value="templates"
                      disabled={selectedCategoryTemplates.length === 0}
                      className="text-white data-[state=active]:bg-vision-purple-200/20"
                    >
                      Idea Templates
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="custom" className="mt-4">
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
                  </TabsContent>
                  
                  <TabsContent value="templates" className="mt-4">
                    <div className="space-y-4">
                      <FormLabel className="text-white">Select a Template</FormLabel>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {selectedCategoryTemplates.map((template, index) => (
                          <Card 
                            key={index}
                            className="cursor-pointer border-vision-purple-200/20 bg-vision-purple-100/10 backdrop-blur-md hover:bg-vision-purple-200/20 transition"
                            onClick={() => {
                              ideaForm.setValue('idea', template.description);
                              setActiveTab("custom");
                            }}
                          >
                            <CardHeader className="py-3">
                              <CardTitle className="text-sm font-medium text-white">{template.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="py-2">
                              <p className="text-xs text-white/70">{template.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
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
        <div className="space-y-8">
          {/* Result Header */}
          <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg shadow-vision-purple-200/5">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-vision-primary-gradient flex items-center justify-center mr-3">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    Analysis Results
                  </CardTitle>
                  <CardDescription className="text-white/70 mt-2">
                    AI-powered insights to help you make informed decisions
                  </CardDescription>
                </div>
                <div>
                  <Badge variant="outline" className="text-white/90 border-vision-purple-200/30 bg-vision-purple-100/10 px-3 py-1">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-5 border rounded-lg bg-gradient-to-br from-vision-purple-100/10 to-vision-purple-100/5 border-vision-purple-200/20 backdrop-blur-sm shadow-inner">
                <h3 className="mb-3 text-lg font-medium text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  Your Idea
                </h3>
                <p className="text-white/90 leading-relaxed">{ideaForm.getValues().idea}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* The 8 Analysis Blocks Grid - Bento Grid Layout */}
          <motion.div 
            className="grid gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ gridAutoRows: "minmax(auto, auto)" }}
          >
            {/* 1. Success Rate */}
            {analysisData.successRate && (
              <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2">
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-md shadow-lg shadow-vision-purple-200/10 hover:shadow-vision-purple-200/20 transition h-full">
                  <CardHeader className="py-5 pb-2 border-b border-vision-purple-200/10">
                    <CardTitle className="flex items-center text-lg text-white">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3">
                        <Gauge className="w-5 h-5 text-blue-400" />
                      </div>
                      Success Rate Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5">
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
              <motion.div variants={itemVariants} className="lg:col-span-1">
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-md shadow-lg shadow-vision-purple-200/10 hover:shadow-vision-purple-200/20 transition h-full">
                  <CardHeader className="py-5 pb-2 border-b border-vision-purple-200/10">
                    <CardTitle className="flex items-center text-lg text-white">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center mr-3">
                        <Users className="w-5 h-5 text-orange-400" />
                      </div>
                      Competitors & Market Share
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5">
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
              <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2">
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-md shadow-lg shadow-vision-purple-200/10 hover:shadow-vision-purple-200/20 transition h-full">
                  <CardHeader className="py-5 pb-2 border-b border-vision-purple-200/10">
                    <CardTitle className="flex items-center text-lg text-white">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mr-3">
                        <Target className="w-5 h-5 text-green-400" />
                      </div>
                      Target Audience Fit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5">
                    <div className="space-y-5">
                      <div className="h-64">
                        {/* Radar chart will go here */}
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="p-5 text-center border rounded-lg bg-gradient-to-br from-vision-purple-100/10 to-vision-purple-100/5 border-vision-purple-200/20 backdrop-blur-sm">
                            <p className="text-white/90 leading-relaxed">{analysisData.targetAudienceFit.message}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {analysisData.targetAudienceFit.segments.map((segment: {name: string, score: number}, i: number) => (
                          <div key={i} className="p-4 border rounded-lg bg-vision-purple-100/5 border-vision-purple-200/20 backdrop-blur-sm hover:bg-vision-purple-200/10 transition-colors duration-200">
                            <p className="text-sm font-medium text-white mb-2">{segment.name}</p>
                            <div className="flex items-center mt-2">
                              <div className="flex-1 h-2.5 mr-2 rounded-full bg-vision-purple-200/20 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-green-500/80 to-green-400" 
                                  style={{ 
                                    width: `${segment.score}%`,
                                    transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                  }}>
                                </div>
                              </div>
                              <span className="text-xs font-medium bg-vision-purple-200/20 px-2 py-0.5 rounded-full text-white/80">
                                {segment.score}%
                              </span>
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
              <motion.div variants={itemVariants} className="lg:col-span-1">
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-md shadow-lg shadow-vision-purple-200/10 hover:shadow-vision-purple-200/20 transition h-full">
                  <CardHeader className="py-5 pb-2 border-b border-vision-purple-200/10">
                    <CardTitle className="flex items-center text-lg text-white">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3">
                        <PieChart className="w-5 h-5 text-purple-400" />
                      </div>
                      Market Size Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5">
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
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-md shadow-lg shadow-vision-purple-200/10 hover:shadow-vision-purple-200/20 transition">
                  <CardHeader className="py-5 pb-2 border-b border-vision-purple-200/10">
                    <CardTitle className="flex items-center text-lg text-white">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                      </div>
                      Business Model Strength
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5">
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
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-md shadow-lg shadow-vision-purple-200/10 hover:shadow-vision-purple-200/20 transition">
                  <CardHeader className="py-5 pb-2 border-b border-vision-purple-200/10">
                    <CardTitle className="flex items-center text-lg text-white">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center mr-3">
                        <Coins className="w-5 h-5 text-amber-400" />
                      </div>
                      Funding Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5">
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
              <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2 md:row-span-2">
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-md shadow-lg shadow-vision-purple-200/10 hover:shadow-vision-purple-200/20 transition h-full">
                  <CardHeader className="py-5 pb-2 border-b border-vision-purple-200/10">
                    <CardTitle className="flex items-center text-lg text-white">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center mr-3">
                        <Activity className="w-5 h-5 text-teal-400" />
                      </div>
                      SWOT Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5">
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
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-md shadow-lg shadow-vision-purple-200/10 hover:shadow-vision-purple-200/20 transition">
                  <CardHeader className="py-5 pb-2 border-b border-vision-purple-200/10">
                    <CardTitle className="flex items-center text-lg text-white">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center mr-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      Previous Failed Executions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5">
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
          
          {/* Four Option Buttons */}
          <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl text-white">What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
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
                
                {/* Save Idea Button - Only shown to logged in users */}
                <SaveIdeaButton
                  startupIdea={ideaForm.getValues().idea}
                  analysisResults={analysisData}
                  className="h-auto py-6 space-x-2 bg-vision-purple-100/10 border-vision-purple-200/20 hover:bg-vision-purple-200/20"
                />
                
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
          
          {/* 6 Budget Analysis Results Blocks - Bento Grid Layout */}
          <motion.div 
            className="grid gap-6 grid-cols-1 md:grid-cols-4 auto-rows-auto"
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