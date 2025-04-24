import { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
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
  Plus,
  PlusCircle,
  Save,
  Share2,
  Target,
  ThumbsDown,
  ThumbsUp,
  Trash,
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
  | "input"            // Initial idea input
  | "loading"          // Processing analysis
  | "results"          // Showing analysis results
  | "plan-input"       // Execution plan input form (replaces budget-input)
  | "plan-loading"     // Processing execution plan
  | "plan-results";    // Showing execution plan results

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

// Schema for validating budget and team form
const budgetSchema = z.object({
  budget: z.string().refine(
    (val) => {
      const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
      return !isNaN(num) && num > 0;
    },
    { message: "Please enter a valid budget amount" }
  ),
  currency: z.string().default("INR"),
  teamSize: z.string().default("1-5"),
  teamComposition: z.array(z.object({
    role: z.string(),
    skills: z.string(),
    importance: z.number().min(1).max(100).default(50),
  })).default([{
    role: "Founder",
    skills: "Leadership, Business Development",
    importance: 100
  }]),
  existingSkills: z.string().optional(),
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
  
  // Progressive loading states
  const [visibleBlocks, setVisibleBlocks] = useState<string[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Analysis blocks to be loaded progressively
  const analysisBlocks = [
    "header",           // Analysis header with the user's idea
    "successRate",      // Success rate analysis
    "competitors",      // Competitors analysis
    "targetAudience",   // Target audience fit
    // "marketSize" removed as requested
    "businessModel",    // Business model strength
    "fundingRequired",  // Funding requirements
    "swotAnalysis",     // SWOT analysis
    "failedExecutions", // Previous failed executions
    "relatedIdeas",     // Related startup ideas
    "actionButtons"     // Action buttons (save, export, etc.)
  ];
  
  // Execution plan blocks to be loaded progressively after "Plan to Execute"
  const executionPlanBlocks = [
    "planHeader",          // Plan header with idea summary
    "budgetAllocation",    // Budget allocation breakdown
    "executionTimeline",   // Step-by-step roadmap with timeframes
    "teamRequirements",    // Required roles and their importance
    "riskAnalysis",        // Key risks and mitigation strategies
    "successMetrics",      // KPIs to track progress
    "planActionButtons"    // Action buttons (share, save, export, etc.)
  ];
  
  // Forms setup
  const ideaForm = useForm<z.infer<typeof startupIdeaSchema>>({
    resolver: zodResolver(startupIdeaSchema),
    defaultValues: {
      idea: searchParams.get('idea') || "",
      country: "India",
    },
  });
  
  const budgetForm = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budget: "",
      currency: "INR", // Setting default currency to INR
      teamSize: "1-5",
      teamComposition: [{
        role: "Founder",
        skills: "Leadership, Business Development",
        importance: 100
      }],
      existingSkills: "",
    },
  });
  
  // Progressive loading function
  const startProgressiveLoading = () => {
    // Reset visible blocks and progress
    setVisibleBlocks([]);
    setLoadingProgress(0);
    
    // Clear any existing timer
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    
    // Start progress animation
    progressTimerRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
          }
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };
  
  // Effect for progressive loading of blocks
  useEffect(() => {
    if (phase === "results" && analysisData) {
      // Clear any existing timers
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      
      setLoadingProgress(100); // Complete the loading progress bar
      
      // Progressive loading of blocks with staggered timing
      const blockTimers: NodeJS.Timeout[] = [];
      
      analysisBlocks.forEach((block, index) => {
        const timer = setTimeout(() => {
          setVisibleBlocks(prev => [...prev, block]);
        }, 300 + (index * 200)); // 300ms initial delay, then 200ms between each block
        
        blockTimers.push(timer);
      });
      
      // Cleanup timers
      return () => {
        blockTimers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [phase, analysisData]);
  
  // Handle startup idea submission
  const onIdeaSubmit = async (values: z.infer<typeof startupIdeaSchema>) => {
    if (!values.idea || values.idea.trim() === "") {
      toast({
        title: "Missing Information",
        description: "Please enter your startup idea description",
        variant: "destructive",
      });
      return;
    }
    
    setPhase("loading");
    startProgressiveLoading(); // Start the progressive loading animation
    
    try {
      console.log("Submitting idea for analysis:", {
        startupIdea: values.idea,
        country: values.country || "Global"
      });
      
      // Add timeout handling with AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout (increased from 2 min)
      
      // Implement retry mechanism for network failures
      let maxRetries = 2;
      let retries = 0;
      let response = null;
      
      while (retries <= maxRetries) {
        try {
          response = await fetch("/api/analyze", {
            method: "POST", 
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              startupIdea: values.idea,
              country: values.country || "Global",
            }),
            signal: controller.signal
          });
          
          // If we got a successful response or a non-retriable error, break the loop
          if (response.status < 500 || response.status === 504) {
            break;
          }
          
          // If we get a 502/500 error, retry after a short delay
          if (response.status === 502 || response.status === 500) {
            retries++;
            if (retries <= maxRetries) {
              console.log(`Retrying request after 502/500 error (attempt ${retries} of ${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 2000 * retries)); // Exponential backoff
              continue;
            }
          }
          
          break;
        } catch (fetchError: unknown) {
          // If the error is not a timeout, retry
          if (fetchError instanceof Error && fetchError.name !== 'AbortError') {
            retries++;
            if (retries <= maxRetries) {
              console.log(`Retrying after fetch error: ${fetchError.message} (attempt ${retries} of ${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 2000 * retries));
              continue;
            }
          }
          throw fetchError;
        }
      }
      
      if (!response) {
        throw new Error("Failed to connect to the analysis server. Please try again later.");
      }
      
      // Clear timeout since we got a response
      clearTimeout(timeoutId);
      
      console.log("Analysis response status:", response.status);
      
      if (!response.ok) {
        // Handle different error status codes appropriately
        let errorMessage = "Failed to analyze startup idea";
        
        if (response.status === 502 || response.status === 504) {
          errorMessage = "The analysis server is taking too long to respond. Please try a shorter description or try again later.";
        } else if (response.status === 429) {
          errorMessage = "Too many requests. Please wait a few minutes before trying again.";
        } else if (response.status === 400) {
          errorMessage = "Invalid request. Please check your startup idea description.";
        } else if (response.status === 503) {
          errorMessage = "AI analysis service is temporarily unavailable. Please try again later.";
        }
        
        // Try to get more detailed error message from response
        try {
          const errorData = await response.json();
          console.error("Error response from server:", errorData);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
          // Fallback to status text if we can't parse the JSON
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse the response data with robust error handling
      let data;
      try {
        // Try standard JSON parsing first
        const responseText = await response.text();
        
        // Log the first part of the response for debugging
        console.log("Response text (first 100 chars):", responseText.substring(0, 100) + "...");
        
        try {
          // Attempt direct JSON parsing
          data = JSON.parse(responseText);
        } catch (directParseError) {
          console.error("Direct JSON parse error:", directParseError);
          
          // Fallback 1: Try to extract JSON from the response using regex
          const jsonMatch = responseText.match(/(\{[\s\S]*\})/);
          if (jsonMatch && jsonMatch[1]) {
            try {
              console.log("Attempting to parse extracted JSON...");
              data = JSON.parse(jsonMatch[1]);
            } catch (extractParseError) {
              console.error("Extract JSON parse error:", extractParseError);
              
              // Fallback 2: Look for JSON in code blocks (in case the API returned markdown)
              const codeBlockMatch = responseText.match(/```(?:json)?([\s\S]*?)```/);
              if (codeBlockMatch && codeBlockMatch[1]) {
                try {
                  console.log("Attempting to parse JSON from code block...");
                  data = JSON.parse(codeBlockMatch[1].trim());
                } catch (codeBlockParseError) {
                  console.error("Code block JSON parse error:", codeBlockParseError);
                  throw new Error("Unable to parse response data. Please try again with a simpler idea description.");
                }
              } else {
                throw new Error("Received malformed data from server. Please try a shorter or simpler description.");
              }
            }
          } else {
            throw new Error("Received invalid response format. Please try again with a different description.");
          }
        }
        
        if (!data) {
          throw new Error("Empty response received from server. Please try again.");
        }
        
        console.log("Analysis response data keys:", Object.keys(data));
      } catch (parseError) {
        console.error("Error handling response data:", parseError);
        throw new Error(parseError instanceof Error ? parseError.message : "Failed to process analysis results. Please try again.");
      }
      
      // Set remaining free analyses for anonymous users
      if (data.meta && data.meta.remainingFreeAnalyses !== null) {
        setRemainingFreeAnalyses(data.meta.remainingFreeAnalyses);
      }
      
      // Store related ideas separately
      if (data.relatedIdeas && data.relatedIdeas.length > 0) {
        setRelatedIdeasData(data.relatedIdeas);
      }
      
      console.log("Analysis completed successfully");
      setAnalysisData(data);
      setPhase("results");
    } catch (err: any) {
      console.error("Error analyzing startup idea:", err);
      setPhase("input");
      
      // Clear any loading animations
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      
      // Special handling for timeout/abort errors
      let errorTitle = "Analysis Failed";
      let errorMessage = err instanceof Error ? err.message : "Failed to analyze your startup idea. Please try again.";
      
      if (err.name === 'AbortError') {
        errorTitle = "Analysis Timeout";
        errorMessage = "The analysis is taking too long to complete. Please try again with a shorter description.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
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
  
  // Handle execution plan submission
  const onPlanSubmit = async (values: z.infer<typeof budgetSchema>) => {
    if (!user) {
      setReturnTo(window.location.pathname);
      setAuthDialogOpen(true);
      return;
    }
    
    // All features are now available to everyone
    
    setPhase("plan-loading");
    
    try {
      const budgetValue = parseFloat(values.budget.replace(/[^0-9.-]+/g, ""));
      
      const response = await apiRequest("POST", "/api/execution-plan", {
        startupIdea: ideaForm.getValues().idea,
        initialBudget: budgetValue,
        currency: "INR", // Always use INR for all requests
        teamSize: values.teamSize,
        teamComposition: values.teamComposition,
        existingSkills: values.existingSkills,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to generate execution plan");
      }
      
      // Log the response data to debug
      console.log("Execution plan response:", data);
      console.log("Response data keys:", Object.keys(data));
      
      // Process response data - ensure we have a consistent structure regardless of server response format
      let processedData = { ...data };
      
      // If plan data is in planToExecute (preferred) or planningToExecute, use it
      const planData = data.planToExecute || data.planningToExecute;
      
      if (planData) {
        console.log("Found execution plan data");
        
        // Make sure budgetAnalysis exists and has the correct structure
        if (!processedData.budgetAnalysis && data.budgetAnalysis) {
          // If budgetAnalysis is at the top level, keep it
          console.log("Using existing budgetAnalysis data");
        } else if (!processedData.budgetAnalysis) {
          // If budgetAnalysis doesn't exist, create it from the plan data or elsewhere
          console.log("Creating budgetAnalysis structure from available data");
          processedData.budgetAnalysis = {};
          
          // Handle all possible locations of analysis data
          // First check top level, then in planData
          
          // Feasibility and Scalability
          if (processedData.feasibilityAndScalability) {
            processedData.budgetAnalysis.feasibilityAndScalability = processedData.feasibilityAndScalability;
          } else if (planData.feasibilityAndScalability) {
            processedData.budgetAnalysis.feasibilityAndScalability = planData.feasibilityAndScalability;
          } else {
            // Add fallback structure to prevent UI errors
            processedData.budgetAnalysis.feasibilityAndScalability = {
              initialFeasibility: 50,
              scalingPoints: [],
              message: "Feasibility analysis not available. Try again later."
            };
            console.warn("Missing feasibilityAndScalability data");
          }
          
          // Risk Analysis
          if (processedData.riskAnalysis) {
            processedData.budgetAnalysis.riskAnalysis = processedData.riskAnalysis;
          } else if (planData.riskAnalysis) {
            processedData.budgetAnalysis.riskAnalysis = planData.riskAnalysis;
          } else {
            processedData.budgetAnalysis.riskAnalysis = {
              overallRisk: 50,
              risks: [],
              message: "Risk analysis not available. Try again later."
            };
            console.warn("Missing riskAnalysis data");
          }
          
          // Go To Market Strategy
          if (processedData.goToMarketStrategy) {
            processedData.budgetAnalysis.goToMarketStrategy = processedData.goToMarketStrategy;
          } else if (planData.goToMarketStrategy) {
            processedData.budgetAnalysis.goToMarketStrategy = planData.goToMarketStrategy;
          } else {
            processedData.budgetAnalysis.goToMarketStrategy = {
              timeline: [],
              message: "Go to market strategy not available. Try again later."
            };
            console.warn("Missing goToMarketStrategy data");
          }
          
          // Long Term Vision
          if (processedData.longTermVision) {
            processedData.budgetAnalysis.longTermVision = processedData.longTermVision;
          } else if (planData.longTermVision) {
            processedData.budgetAnalysis.longTermVision = planData.longTermVision;
          } else {
            processedData.budgetAnalysis.longTermVision = {
              milestones: [],
              message: "Long term vision not available. Try again later."
            };
            console.warn("Missing longTermVision data");
          }
          
          // Team Execution
          if (processedData.teamExecution) {
            processedData.budgetAnalysis.teamExecution = processedData.teamExecution;
          } else if (planData.teamExecution) {
            processedData.budgetAnalysis.teamExecution = planData.teamExecution;
          } else {
            processedData.budgetAnalysis.teamExecution = {
              requiredRoles: [],
              hiringTimeline: "Not available",
              message: "Team execution plan not available. Try again later."
            };
            console.warn("Missing teamExecution data");
          }
          
          // Funding and Investors
          if (processedData.fundingInvestors) {
            processedData.budgetAnalysis.fundingInvestors = processedData.fundingInvestors;
          } else if (planData.fundingInvestors) {
            processedData.budgetAnalysis.fundingInvestors = planData.fundingInvestors;
          } else {
            processedData.budgetAnalysis.fundingInvestors = {
              investors: [],
              message: "Funding and investor recommendations not available. Try again later."
            };
            console.warn("Missing fundingInvestors data");
          }
        }
      } else {
        console.warn("Missing execution plan data in the response");
        // Create minimal structure to prevent UI errors
        processedData.budgetAnalysis = {
          feasibilityAndScalability: {
            initialFeasibility: 50,
            scalingPoints: [],
            message: "Execution plan data not available. Try again later."
          },
          riskAnalysis: {
            overallRisk: 50,
            risks: [],
            message: "Risk analysis not available. Try again later."
          },
          goToMarketStrategy: {
            timeline: [],
            message: "Go to market strategy not available. Try again later."
          },
          longTermVision: {
            milestones: [],
            message: "Long term vision not available. Try again later."
          },
          teamExecution: {
            requiredRoles: [],
            hiringTimeline: "Not available",
            message: "Team execution plan not available. Try again later."
          },
          fundingInvestors: {
            investors: [],
            message: "Funding and investor recommendations not available. Try again later."
          }
        };
      }
      
      // Also get investor recommendations
      const investorsResponse = await apiRequest("POST", "/api/investors", {
        startupIdea: ideaForm.getValues().idea,
      });
      
      if (investorsResponse.ok) {
        const investorsData = await investorsResponse.json();
        processedData.investorsData = investorsData;
      }
      
      setBudgetAnalysisData(processedData);
      setPhase("plan-results");
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
  
  const handleExportPDF = async () => {
    if (!user) {
      setReturnTo(window.location.pathname);
      setAuthDialogOpen(true);
      return;
    }
    
    try {
      // Show a loading toast
      toast({
        title: "Export Started",
        description: "Your PDF is being generated and will download shortly.",
      });
      
      // Dynamically import jsPDF and html2canvas
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      
      // Set up the document title and properties
      const ideaText = ideaForm.getValues().idea || "Startup Idea";
      const country = ideaForm.getValues().country || "Global";
      const title = `Startup Analysis: ${ideaText.substring(0, 40)}${ideaText.length > 40 ? '...' : ''}`;
      
      // Add a header to the PDF
      pdf.setFontSize(22);
      pdf.setTextColor(117, 81, 255); // Vision purple
      pdf.text(title, width / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, width / 2, 28, { align: 'center' });
      pdf.text(`Market: ${country}`, width / 2, 34, { align: 'center' });
      
      // Add the startup idea description
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Startup Idea:', 14, 45);
      
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      const splitTitle = pdf.splitTextToSize(ideaText, width - 28);
      pdf.text(splitTitle, 14, 52);
      
      let currentY = 52 + (splitTitle.length * 5);
      
      // Add a small gap
      currentY += 10;
      
      // Add the success rate and business model strength
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Key Metrics:', 14, currentY);
      currentY += 8;
      
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Success Rate: ${analysisData.successRate}%`, 14, currentY);
      currentY += 6;
      pdf.text(`Business Model Strength: ${analysisData.businessModelStrength}/10`, 14, currentY);
      currentY += 6;
      pdf.text(`Market Size: ${analysisData.marketSize}`, 14, currentY);
      currentY += 6;
      pdf.text(`Funding Required: ${analysisData.fundingRequired}`, 14, currentY);
      
      // Add a small gap
      currentY += 10;
      
      // Add the SWOT analysis
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('SWOT Analysis:', 14, currentY);
      currentY += 8;
      
      // Strengths
      pdf.setFontSize(12);
      pdf.setTextColor(39, 174, 96); // Green
      pdf.text('Strengths:', 14, currentY);
      currentY += 6;
      
      pdf.setTextColor(80, 80, 80);
      for (const strength of analysisData.swotAnalysis.strengths) {
        const lines = pdf.splitTextToSize(`• ${strength}`, width - 28);
        pdf.text(lines, 14, currentY);
        currentY += lines.length * 5 + 2;
      }
      
      // Weaknesses
      pdf.setFontSize(12);
      pdf.setTextColor(231, 76, 60); // Red
      pdf.text('Weaknesses:', 14, currentY);
      currentY += 6;
      
      pdf.setTextColor(80, 80, 80);
      for (const weakness of analysisData.swotAnalysis.weaknesses) {
        const lines = pdf.splitTextToSize(`• ${weakness}`, width - 28);
        pdf.text(lines, 14, currentY);
        currentY += lines.length * 5 + 2;
      }
      
      // Check if we need a new page (if y position > 250mm)
      if (currentY > 250) {
        pdf.addPage();
        currentY = 20;
      }
      
      // Opportunities
      pdf.setFontSize(12);
      pdf.setTextColor(52, 152, 219); // Blue
      pdf.text('Opportunities:', 14, currentY);
      currentY += 6;
      
      pdf.setTextColor(80, 80, 80);
      for (const opportunity of analysisData.swotAnalysis.opportunities) {
        const lines = pdf.splitTextToSize(`• ${opportunity}`, width - 28);
        pdf.text(lines, 14, currentY);
        currentY += lines.length * 5 + 2;
      }
      
      // Threats
      pdf.setFontSize(12);
      pdf.setTextColor(230, 126, 34); // Orange
      pdf.text('Threats:', 14, currentY);
      currentY += 6;
      
      pdf.setTextColor(80, 80, 80);
      for (const threat of analysisData.swotAnalysis.threats) {
        const lines = pdf.splitTextToSize(`• ${threat}`, width - 28);
        pdf.text(lines, 14, currentY);
        currentY += lines.length * 5 + 2;
      }
      
      // Check if we need a new page
      if (currentY > 250) {
        pdf.addPage();
        currentY = 20;
      }
      
      // Add execution plan data if available
      if (phase === "plan-results" && budgetAnalysisData) {
        // Add a small gap
        currentY += 10;
        
        pdf.setFontSize(16);
        pdf.setTextColor(117, 81, 255); // Vision purple
        pdf.text('Execution Plan', width / 2, currentY, { align: 'center' });
        currentY += 10;
        
        if (budgetAnalysisData.budgetAnalysis?.breakdown) {
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text('Budget Breakdown:', 14, currentY);
          currentY += 8;
          
          pdf.setFontSize(12);
          pdf.setTextColor(80, 80, 80);
          
          for (const category of budgetAnalysisData.budgetAnalysis.breakdown) {
            const text = `${category.category}: ${category.amount} (${category.percentage}%)`;
            const lines = pdf.splitTextToSize(text, width - 28);
            pdf.text(lines, 14, currentY);
            currentY += lines.length * 5 + 2;
          }
        }
        
        // Check if we need a new page
        if (currentY > 250) {
          pdf.addPage();
          currentY = 20;
        }
        
        // Add top investor recommendations if available
        if (budgetAnalysisData.investorsData?.investors && budgetAnalysisData.investorsData.investors.length > 0) {
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text('Potential Investors:', 14, currentY);
          currentY += 8;
          
          pdf.setFontSize(12);
          pdf.setTextColor(80, 80, 80);
          
          for (const investor of budgetAnalysisData.investorsData.investors) {
            pdf.setTextColor(117, 81, 255); // Vision purple
            pdf.text(`${investor.name} (${investor.firm})`, 14, currentY);
            currentY += 6;
            
            pdf.setTextColor(80, 80, 80);
            pdf.text(`Focus: ${investor.investmentFocus.join(', ')}`, 20, currentY);
            currentY += 5;
            pdf.text(`Location: ${investor.location}`, 20, currentY);
            currentY += 5;
            pdf.text(`Portfolio Fit: ${investor.portfolioFit}%`, 20, currentY);
            currentY += 5;
            
            if (investor.contactInfo) {
              pdf.text(`Contact: ${investor.contactInfo}`, 20, currentY);
              currentY += 5;
            }
            
            currentY += 5; // Add space between investors
          }
        }
      }
      
      // Add disclaimer at the bottom of the last page
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Generated by GENIQL - AI Startup Analysis Platform. For informational purposes only.', width / 2, height - 10, { align: 'center' });
      
      // Save the PDF
      pdf.save(`GENIQL-Startup-Analysis-${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Show success message
      toast({
        title: "Export Complete",
        description: "Your analysis has been downloaded as a PDF."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Export Failed",
        description: "There was a problem generating your PDF. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleShareToCommunity = async () => {
    if (!user) {
      setReturnTo(window.location.pathname);
      setAuthDialogOpen(true);
      return;
    }
    
    try {
      // Get the current startup idea
      const ideaText = ideaForm.getValues().idea;
      const country = ideaForm.getValues().country || "Global";
      
      // Prepare the post content with analysis highlights
      const postContent = `
## Startup Idea: ${ideaText.substring(0, 100)}${ideaText.length > 100 ? '...' : ''}

### Key Analytics:
- Success Rate: ${analysisData.successRate}%
- Business Model Strength: ${analysisData.businessModelStrength}/10
- Market Size: ${analysisData.marketSize}
- Funding Required: ${analysisData.fundingRequired}

### SWOT Analysis:
**Strengths:**
${analysisData.swotAnalysis.strengths.map((s: string) => `- ${s}`).join('\n')}

**Weaknesses:**
${analysisData.swotAnalysis.weaknesses.map((w: string) => `- ${w}`).join('\n')}

**Opportunities:**
${analysisData.swotAnalysis.opportunities.map((o: string) => `- ${o}`).join('\n')}

**Threats:**
${analysisData.swotAnalysis.threats.map((t: string) => `- ${t}`).join('\n')}

*Analysis performed on ${new Date().toLocaleDateString()} for ${country} market using GENIQL AI*
      `;
      
      // Make API call to create the community post
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Startup Idea: ${ideaText.substring(0, 80)}${ideaText.length > 80 ? '...' : ''}`,
          content: postContent,
          category: "startup_analysis",
          tags: ["startup", "analysis", country.toLowerCase().replace(/\s+/g, '_')],
        }),
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create community post: ${response.statusText}`);
      }
      
      const postData = await response.json();
      
      // Success message with redirection
      toast({
        title: "Post Created",
        description: "Your analysis has been shared to the community.",
      });
      
      // Redirect to the community page/post
      setTimeout(() => {
        window.location.href = `/community/post/${postData.id}`;
      }, 1500);
    } catch (error) {
      console.error("Error sharing to community:", error);
      toast({
        title: "Share Failed",
        description: error instanceof Error ? error.message : "Failed to share your analysis. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSaveAnalysis = async () => {
    if (!user) {
      setReturnTo(window.location.pathname);
      setAuthDialogOpen(true);
      return;
    }
    
    try {
      // Get the current startup idea
      const ideaText = ideaForm.getValues().idea;
      const country = ideaForm.getValues().country || "Global";
      
      // Create a results snapshot from the current analysis data
      const resultsSnapshot = {
        successRate: analysisData.successRate,
        marketSize: analysisData.marketSize,
        businessModelStrength: analysisData.businessModelStrength,
        fundingRequired: analysisData.fundingRequired,
        swotAnalysis: analysisData.swotAnalysis,
        ...(budgetAnalysisData?.budgetAnalysis && { budgetAnalysis: budgetAnalysisData.budgetAnalysis }),
        ...(budgetAnalysisData?.investorsData && { investorsData: budgetAnalysisData.investorsData })
      };
      
      // Make API call to save the idea
      const response = await fetch("/api/saved-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Startup Idea: ${ideaText.substring(0, 40)}${ideaText.length > 40 ? '...' : ''}`,
          description: ideaText,
          ideaType: "startup",
          notes: `Analysis performed for ${country} market`,
          resultsSnapshot: JSON.stringify(resultsSnapshot)
        }),
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save analysis: ${response.statusText}`);
      }
      
      // Success message
      toast({
        title: "Analysis Saved",
        description: "Your startup analysis has been saved to your account."
      });
    } catch (error) {
      console.error("Error saving analysis:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save your analysis. Please try again.",
        variant: "destructive"
      });
    }
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
              <Progress value={loadingProgress} className="h-2 bg-vision-purple-200/20" />
            </div>
            <p className="mt-4 text-sm text-white/70">
              {loadingProgress < 30 && "Gathering market data..."}
              {loadingProgress >= 30 && loadingProgress < 60 && "Analyzing competitors..."}
              {loadingProgress >= 60 && loadingProgress < 85 && "Evaluating business model..."}
              {loadingProgress >= 85 && "Finalizing insights..."}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* RESULTS PHASE */}
      {phase === "results" && analysisData && (
        <div className="space-y-8">
          {/* Result Header */}
          <AnimatePresence>
            {visibleBlocks.includes("header") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* The 8 Analysis Blocks Grid - Bento Grid Layout */}
          <motion.div 
            className="grid gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ gridAutoRows: "minmax(auto, auto)" }}
          >
            {/* 1. Success Rate */}
            {analysisData.successRate && visibleBlocks.includes("successRate") && (
              <motion.div 
                variants={itemVariants} 
                className="md:col-span-2 lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
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
                      country={ideaForm.getValues().country || "United States"}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* 2. Competitors & Market Share */}
            {analysisData.competitors && visibleBlocks.includes("competitors") && (
              <motion.div 
                variants={itemVariants} 
                className="lg:col-span-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
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
            {analysisData.targetAudienceFit && visibleBlocks.includes("targetAudience") && (
              <motion.div 
                variants={itemVariants} 
                className="lg:col-span-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
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
            
            {/* Market Size Analysis block has been removed as requested */}
            
            {/* 5. Business Model Strength */}
            {analysisData.businessModelStrength && visibleBlocks.includes("businessModel") && (
              <motion.div 
                variants={itemVariants} 
                className="md:col-span-2 lg:col-span-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-md shadow-lg shadow-vision-purple-200/10 hover:shadow-vision-purple-200/20 transition h-full">
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
                      country={ideaForm.getValues().country || "United States"}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* 6. Funding Requirements */}
            {analysisData.fundingRequired && visibleBlocks.includes("fundingRequired") && (
              <motion.div 
                variants={itemVariants} 
                className="md:col-span-2 lg:col-span-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-md shadow-lg shadow-vision-purple-200/10 hover:shadow-vision-purple-200/20 transition h-full">
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
                      country={ideaForm.getValues().country || "United States"}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* 7. SWOT Analysis */}
            {analysisData.swotAnalysis && visibleBlocks.includes("swotAnalysis") && (
              <motion.div 
                variants={itemVariants} 
                className="md:col-span-2 lg:col-span-2 md:row-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
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
            {analysisData.previousFailedExecutions && visibleBlocks.includes("failedExecutions") && (
              <motion.div 
                variants={itemVariants} 
                className="lg:col-span-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-md shadow-lg shadow-vision-purple-200/10 hover:shadow-vision-purple-200/20 transition h-full">
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
          {relatedIdeasData.length > 0 && visibleBlocks.includes("relatedIdeas") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
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
            </motion.div>
          )}
          
          {/* Four Option Buttons */}
          {visibleBlocks.includes("actionButtons") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl text-white">What's Next?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
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
                      onClick={() => setPhase("plan-input")}
                    >
                      <Coins className="w-5 h-5 mr-2" />
                      <div className="text-left">
                        <div className="text-sm font-medium">Plan to Execute</div>
                        <div className="text-xs text-white/70">Get detailed execution plan based on budget</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}
      
      {/* EXECUTION PLAN INPUT PHASE */}
      {phase === "plan-input" && (
        <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-white">Plan Your Execution</CardTitle>
            <CardDescription className="text-white/70">
              Enter your available budget and team information to get a detailed execution plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...budgetForm}>
              <form onSubmit={budgetForm.handleSubmit(onPlanSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Budget Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Budget Information</h3>
                    
                    <FormField
                      control={budgetForm.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Initial Budget</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="₹10,00,000"
                              className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white placeholder:text-white/50"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-white/70">
                            Enter your available initial budget
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={budgetForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Currency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/20">
                              <SelectItem value="INR" className="text-white hover:bg-vision-purple-200/20">
                                INR - Indian Rupee (₹)
                              </SelectItem>
                              <SelectItem value="USD" className="text-white hover:bg-vision-purple-200/20">
                                USD - US Dollar ($)
                              </SelectItem>
                              <SelectItem value="EUR" className="text-white hover:bg-vision-purple-200/20">
                                EUR - Euro (€)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Team Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Team Information</h3>
                    
                    <FormField
                      control={budgetForm.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Current Team Size</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white">
                                <SelectValue placeholder="Select team size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/20">
                              <SelectItem value="1-5" className="text-white hover:bg-vision-purple-200/20">
                                1-5 people
                              </SelectItem>
                              <SelectItem value="6-10" className="text-white hover:bg-vision-purple-200/20">
                                6-10 people
                              </SelectItem>
                              <SelectItem value="11-20" className="text-white hover:bg-vision-purple-200/20">
                                11-20 people
                              </SelectItem>
                              <SelectItem value="21-50" className="text-white hover:bg-vision-purple-200/20">
                                21-50 people
                              </SelectItem>
                              <SelectItem value="50+" className="text-white hover:bg-vision-purple-200/20">
                                50+ people
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={budgetForm.control}
                      name="existingSkills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Existing Team Skills</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Leadership, Engineering, Marketing, Design, etc."
                              className="min-h-[80px] bg-vision-purple-100/10 border-vision-purple-200/20 text-white placeholder:text-white/50"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-white/70">
                            Describe the skills your current team has
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Team Composition Section - Dynamic roles */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-4">Key Team Roles Needed</h3>
                  
                  {budgetForm.watch("teamComposition").map((_, index) => (
                    <div key={index} className="grid gap-4 md:grid-cols-3 mb-4 p-4 border border-vision-purple-200/20 rounded-md">
                      <FormField
                        control={budgetForm.control}
                        name={`teamComposition.${index}.role`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Role Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="CTO, Marketing Director, etc."
                                className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white placeholder:text-white/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={budgetForm.control}
                        name={`teamComposition.${index}.skills`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Required Skills</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Technical skills, experience, etc."
                                className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white placeholder:text-white/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={budgetForm.control}
                        name={`teamComposition.${index}.importance`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Importance (1-100)</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Slider 
                                  className="flex-1" 
                                  min={1} 
                                  max={100} 
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(values) => field.onChange(values[0])}
                                />
                                <span className="text-white min-w-[30px] text-center">{field.value}</span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  
                  <div className="flex space-x-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20"
                      onClick={() => {
                        const currentRoles = budgetForm.getValues("teamComposition");
                        budgetForm.setValue("teamComposition", [
                          ...currentRoles,
                          { role: "", skills: "", importance: 50 }
                        ]);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Role
                    </Button>
                    
                    {budgetForm.watch("teamComposition").length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20"
                        onClick={() => {
                          const currentRoles = budgetForm.getValues("teamComposition");
                          if (currentRoles.length > 1) {
                            budgetForm.setValue("teamComposition", currentRoles.slice(0, -1));
                          }
                        }}
                      >
                        <Trash className="w-4 h-4 mr-1" />
                        Remove Last
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-8">
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
      
      {/* PLAN LOADING STATE */}
      {phase === "plan-loading" && (
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
      
      {/* PLAN RESULTS PHASE */}
      {phase === "plan-results" && budgetAnalysisData && (
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
            className="grid gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ gridAutoRows: "minmax(auto, auto)" }}
          >
            {/* 1. Feasibility and Scalability */}
            <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2">
              <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg text-white">
                    <LineChart className="w-5 h-5 mr-2 text-primary" />
                    Feasibility & Scalability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FeasibilityScalability
                    initialFeasibility={budgetAnalysisData.budgetAnalysis?.feasibilityAndScalability?.initialFeasibility || 50}
                    scalingPoints={budgetAnalysisData.budgetAnalysis?.feasibilityAndScalability?.scalingPoints || []}
                    message={budgetAnalysisData.budgetAnalysis?.feasibilityAndScalability?.message || "Feasibility analysis not available"}
                  />
                </CardContent>
              </Card>
            </motion.div>
            
            {/* 2. Risk Analysis */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg text-white">
                    <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
                    Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RiskAnalysis
                    overallRisk={budgetAnalysisData.budgetAnalysis?.riskAnalysis?.overallRisk || 50}
                    risks={budgetAnalysisData.budgetAnalysis?.riskAnalysis?.risks || []}
                    message={budgetAnalysisData.budgetAnalysis?.riskAnalysis?.message || "Risk analysis not available"}
                  />
                </CardContent>
              </Card>
            </motion.div>
            
            {/* 3. Go-to-Market Strategy */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg text-white">
                    <Compass className="w-5 h-5 mr-2 text-primary" />
                    Go-to-Market Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GoToMarketStrategy
                    timeline={budgetAnalysisData.budgetAnalysis?.goToMarketStrategy?.timeline || []}
                    message={budgetAnalysisData.budgetAnalysis?.goToMarketStrategy?.message || "Go-to-market strategy not available"}
                  />
                </CardContent>
              </Card>
            </motion.div>
            
            {/* 4. Long Term Vision */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg text-white">
                    <Eye className="w-5 h-5 mr-2 text-primary" />
                    Long-Term Vision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LongTermVision
                    milestones={budgetAnalysisData.budgetAnalysis?.longTermVision?.milestones || []}
                    message={budgetAnalysisData.budgetAnalysis?.longTermVision?.message || "Long-term vision not available"}
                  />
                </CardContent>
              </Card>
            </motion.div>
            
            {/* 5. Team Execution Capability */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg text-white">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Team Execution Capability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TeamExecution
                    requiredRoles={budgetAnalysisData.budgetAnalysis?.teamExecutionCapability?.requiredRoles || []}
                    hiringTimeline={budgetAnalysisData.budgetAnalysis?.teamExecutionCapability?.hiringTimeline || "Not available"}
                    message={budgetAnalysisData.budgetAnalysis?.teamExecutionCapability?.message || "Team execution plan not available"}
                  />
                </CardContent>
              </Card>
            </motion.div>
            
            {/* 6. Funding & Investment Potential - Full screen */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md hover:border-vision-purple-200/30 transition h-full">
                <CardHeader className="pb-0 pt-4">
                  {/* Title moved to FundingInvestors component */}
                </CardHeader>
                <CardContent className="pt-0">
                  <FundingInvestors
                    investors={budgetAnalysisData.investorsData?.investors || []}
                    message={budgetAnalysisData.investorsData?.message || "Funding and investment recommendations not available"}
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