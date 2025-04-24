import { useState, useEffect, useRef, useContext } from "react";
import { useLocation } from "wouter";
import { AuthContext } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AuthDialog } from "@/components/auth-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StartupAnalyzerResultsOptimized from "@/components/startup-analyzer-results-optimized";
import { AnalysisResults } from "@shared/schema";
import { Rocket, Loader2, BookOpen, ChevronsUp, LucideIcon } from "lucide-react";
import { detectUserCountry } from "@/lib/utils";
import { OptimizedCard } from "@/components/analysis/optimized-card";

// More efficient ENUM for analysis phase
type AnalysisPhase = "input" | "analyzing" | "results";

// Define template type for type safety
type Template = {
  title: string;
  description: string;
};

type CategoryTemplates = {
  [key in 'tech' | 'ecommerce' | 'education' | 'health']: Template[];
};

// Analysis category templates (static - no complex fetching logic)
const CATEGORY_TEMPLATES: CategoryTemplates = {
  tech: [
    { title: "AI-Driven Health Analytics Platform", description: "An AI-based platform that analyzes health data to provide personalized wellness recommendations, integrating with wearable devices." },
    { title: "Smart Home Energy Management System", description: "A system that optimizes energy usage in homes through AI and IoT, reducing energy bills and environmental impact." },
    { title: "Blockchain-based Supply Chain Verification", description: "A platform that uses blockchain to verify product authenticity and track product journey from manufacturer to consumer." }
  ],
  ecommerce: [
    { title: "Sustainable Fashion Marketplace", description: "An online marketplace connecting eco-conscious consumers with sustainable fashion brands and second-hand luxury items." },
    { title: "Local Artisan Food Delivery Service", description: "A service that delivers locally-produced artisanal food products directly from producers to consumers." },
    { title: "Personalized Gift Curation Platform", description: "A platform that uses AI to recommend and curate personalized gift ideas based on recipient preferences and occasions." }
  ],
  education: [
    { title: "Interactive Coding Learning Platform", description: "An interactive platform that teaches coding through real-world projects with personalized learning paths." },
    { title: "Virtual Reality Educational Tours", description: "VR software that offers immersive educational tours of historical sites, museums, and natural wonders for schools." },
    { title: "Peer-to-Peer Knowledge Sharing Network", description: "A platform connecting students with peers for tutoring, skill sharing, and collaborative learning." }
  ],
  health: [
    { title: "Mental Health Support App", description: "An application providing accessible mental health resources, guided meditation, and connection to therapists." },
    { title: "Personalized Nutrition Planning Service", description: "A service that creates customized nutrition plans based on individual health data, preferences, and goals." },
    { title: "Remote Patient Monitoring System", description: "A system for healthcare providers to remotely monitor chronically ill patients through connected devices." }
  ]
};

// Define category type for consistency
type Category = keyof CategoryTemplates;

// Lightweight category selection component
const CategorySelector = ({ 
  selectedCategory, 
  onSelect 
}: { 
  selectedCategory: Category; 
  onSelect: (category: Category) => void 
}) => {
  // Get categories as typed array
  const categories = Object.keys(CATEGORY_TEMPLATES) as Category[];
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {categories.map((category) => (
        <button
          key={category}
          className={`p-3 rounded-md text-center transition-colors ${
            selectedCategory === category
              ? "bg-primary/20 border border-primary"
              : "bg-card/80 border border-transparent hover:bg-card"
          }`}
          onClick={() => onSelect(category)}
        >
          <div className="font-medium capitalize text-sm">
            {category}
          </div>
        </button>
      ))}
    </div>
  );
};

// Optimized analysis page
export default function AnalysisPageOptimized() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const { toast } = useToast();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.search.toString());
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [returnTo, setReturnTo] = useState("");
  
  // State management - minimized and optimized
  const [phase, setPhase] = useState<AnalysisPhase>("input");
  const [startupIdea, setStartupIdea] = useState("");
  const [analysisData, setAnalysisData] = useState<AnalysisResults | null>(null);
  const [country, setCountry] = useState("India");
  const [activeTab, setActiveTab] = useState<string>("custom");
  const [selectedCategory, setSelectedCategory] = useState<Category>("tech");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isSavingIdea, setIsSavingIdea] = useState(false);
  
  // Progress simulation with reduced impact
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);
  
  // Handle tab change with minimal re-renders
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "template") {
      setSelectedTemplate(CATEGORY_TEMPLATES[selectedCategory][0]);
    } else {
      setSelectedTemplate(null);
    }
  };
  
  // Handle category change with efficient updates
  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setSelectedTemplate(CATEGORY_TEMPLATES[category][0]);
  };
  
  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setStartupIdea(template.description);
  };
  
  // Start analysis with optimized progress simulation
  const handleStartAnalysis = async () => {
    // Do not proceed if empty input
    if (!startupIdea.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter your startup idea first.",
        variant: "destructive"
      });
      return;
    }
    
    // Update phases and start progress simulation
    setPhase("analyzing");
    setAnalysisProgress(0);
    
    // Simulate gradual progress to improve perceived performance
    progressTimerRef.current = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressTimerRef.current!);
          return 95;
        }
        return prev + (1 + Math.random() * 2);
      });
    }, 500);
    
    try {
      // API call to analyze startup idea
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startupIdea,
          country
        }),
      });
      
      // Clean up progress timer
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      
      if (!response.ok) {
        throw new Error(`Analysis failed with status: ${response.status}`);
      }
      
      // Process successful response
      const data = await response.json();
      setAnalysisData(data);
      setPhase("results");
      setAnalysisProgress(100);
      
    } catch (error) {
      console.error("Error analyzing startup idea:", error);
      
      // Clear interval and reset progress
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      
      setPhase("input");
      setAnalysisProgress(0);
      
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze your startup idea. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Reset analysis to start a new one
  const handleStartOver = () => {
    setPhase("input");
    setAnalysisProgress(0);
    setAnalysisData(null);
  };
  
  // Handle saving the analysis results
  const handleSaveResults = async () => {
    if (!user) {
      setAuthDialogOpen(true);
      setReturnTo(location);
      return;
    }
    
    if (!analysisData) return;
    
    setIsSavingIdea(true);
    
    try {
      const response = await fetch("/api/saved-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: selectedTemplate?.title || "My Startup Idea",
          description: startupIdea,
          ideaType: selectedCategory || "custom",
          resultsSnapshot: analysisData
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save idea");
      }
      
      toast({
        title: "Idea saved successfully",
        description: "You can access it in your Saved Ideas section.",
      });
      
    } catch (error) {
      toast({
        title: "Failed to save idea",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSavingIdea(false);
    }
  };
  
  // Different UI states based on analysis phase
  if (phase === "analyzing") {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <OptimizedCard className="p-6 text-center">
          <div className="max-w-lg mx-auto">
            <div className="mb-6">
              <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Analyzing Your Startup Idea</h2>
            <p className="text-muted-foreground mb-8">
              We're performing a comprehensive analysis of your idea. This may take a minute as we gather insights specifically for the Indian market.
            </p>
            
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mb-2">
              <div 
                className="bg-primary h-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.floor(analysisProgress))}%` }}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              {analysisProgress < 30 && "Gathering market data..."}
              {analysisProgress >= 30 && analysisProgress < 60 && "Analyzing competitive landscape..."}
              {analysisProgress >= 60 && analysisProgress < 85 && "Evaluating business model viability..."}
              {analysisProgress >= 85 && "Finalizing recommendations..."}
            </div>
          </div>
        </OptimizedCard>
      </div>
    );
  }
  
  if (phase === "results" && analysisData) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleStartOver}
          >
            Analyze Another Idea
          </Button>
        </div>
        
        <OptimizedCard className="p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Your Startup Idea</h2>
            <p className="mt-2 whitespace-pre-line">{startupIdea}</p>
          </div>
        </OptimizedCard>
        
        {/* Optimized results component */}
        <StartupAnalyzerResultsOptimized 
          results={analysisData} 
          country={country}
          onSave={handleSaveResults}
          isSaving={isSavingIdea}
        />
      </div>
    );
  }
  
  // Default input phase UI
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <OptimizedCard className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Analyze Your Startup Idea</h1>
            <p className="text-muted-foreground mb-6">
              Our AI-powered analysis engine will evaluate your idea's market potential, competitive landscape, and success factors with a specific focus on the Indian market.
            </p>
            
            <div className="mb-6">
              <div className="flex mb-4 border-b">
                <button
                  className={`pb-2 px-4 border-b-2 text-sm font-medium ${
                    activeTab === "custom"
                      ? "border-primary text-primary"
                      : "border-transparent hover:text-primary/80 text-muted-foreground"
                  }`}
                  onClick={() => handleTabChange("custom")}
                >
                  Custom Idea
                </button>
                <button
                  className={`pb-2 px-4 border-b-2 text-sm font-medium ${
                    activeTab === "template"
                      ? "border-primary text-primary"
                      : "border-transparent hover:text-primary/80 text-muted-foreground"
                  }`}
                  onClick={() => handleTabChange("template")}
                >
                  Idea Templates
                </button>
              </div>
              
              {activeTab === "template" && (
                <div className="space-y-4">
                  <CategorySelector 
                    selectedCategory={selectedCategory}
                    onSelect={handleCategoryChange}
                  />
                  
                  <div className="grid grid-cols-1 gap-3">
                    {CATEGORY_TEMPLATES[selectedCategory].map((template, index) => (
                      <Button
                        key={index}
                        variant={selectedTemplate?.title === template.title ? "default" : "outline"}
                        className="justify-start text-left h-auto py-3"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div>
                          <div className="font-medium">{template.title}</div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {template.description}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === "custom" && (
                <div className="space-y-4">
                  <div>
                    <Select
                      value={country}
                      onValueChange={setCountry}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Country context for market analysis
                    </p>
                  </div>
                  
                  <Textarea
                    placeholder="Describe your startup idea in detail..."
                    value={startupIdea}
                    onChange={(e) => setStartupIdea(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              )}
              
              <Button 
                className="mt-6 w-full"
                onClick={handleStartAnalysis}
                disabled={!startupIdea.trim()}
              >
                <Rocket className="mr-2 h-4 w-4" />
                Analyze My Idea
              </Button>
            </div>
          </div>
          
          <div className="bg-card/50 p-6 rounded-lg border border-border/40 hidden lg:block">
            <h2 className="text-xl font-bold mb-4">How It Works</h2>
            
            <div className="space-y-4">
              <StepItem 
                number={1} 
                title="Describe Your Idea" 
                description="Provide a detailed description of your startup idea for comprehensive analysis."
                icon={BookOpen}
              />
              
              <StepItem 
                number={2} 
                title="AI-Powered Analysis" 
                description="Our advanced AI analyzes your idea across multiple dimensions with India-specific insights."
                icon={Rocket}
              />
              
              <StepItem 
                number={3} 
                title="Get Detailed Results" 
                description="Receive in-depth analysis including success probability, market size, and funding requirements."
                icon={ChevronsUp}
              />
            </div>
            
            <div className="mt-6">
              <div className="text-sm font-medium">Analysis includes:</div>
              <ul className="mt-2 space-y-1">
                <li className="text-sm flex items-center">
                  <span className="text-primary mr-2 text-xs">•</span>
                  Indian market size and growth potential
                </li>
                <li className="text-sm flex items-center">
                  <span className="text-primary mr-2 text-xs">•</span>
                  Competitor analysis with India-specific players
                </li>
                <li className="text-sm flex items-center">
                  <span className="text-primary mr-2 text-xs">•</span>
                  Business model strength evaluation
                </li>
                <li className="text-sm flex items-center">
                  <span className="text-primary mr-2 text-xs">•</span>
                  Target audience fit for Indian demographics
                </li>
                <li className="text-sm flex items-center">
                  <span className="text-primary mr-2 text-xs">•</span>
                  SWOT analysis with regional context
                </li>
              </ul>
            </div>
          </div>
        </div>
      </OptimizedCard>
      
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        returnTo={returnTo}
      />
    </div>
  );
}

// Helper component for steps
function StepItem({ 
  number, 
  title, 
  description, 
  icon: Icon 
}: { 
  number: number; 
  title: string; 
  description: string; 
  icon: LucideIcon;
}) {
  return (
    <div className="flex">
      <div className="bg-primary/10 flex items-center justify-center rounded-full w-10 h-10 mr-4 flex-shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}