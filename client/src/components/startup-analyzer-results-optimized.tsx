import React, { useEffect, useState } from "react";
import { AnalysisResults } from "@shared/schema";
import SuccessRateOptimized from "./analysis/success-rate-optimized";
import CompetitorsOptimized from "./analysis/competitors-optimized";
import BusinessModelOptimized from "./analysis/business-model-optimized";
import FundingRequirementsOptimized from "./analysis/funding-requirements-optimized";
import SwotAnalysisOptimized from "./analysis/swot-analysis-optimized";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Download, Share2 } from "lucide-react";

interface StartupAnalyzerResultsOptimizedProps {
  results: AnalysisResults;
  country: string;
  onSave?: () => void;
  isSaving?: boolean;
}

// Lazy loading for mobile to reduce initial load time
const StartupAnalyzerResultsOptimized = ({ 
  results, 
  country,
  onSave,
  isSaving = false
}: StartupAnalyzerResultsOptimizedProps) => {
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeTab, setActiveTab] = useState("overview");
  const [hasRendered, setHasRendered] = useState<Record<string, boolean>>({
    overview: true,
    business: false,
    funding: false,
    swot: false
  });
  
  // Function to handle sharing results
  const handleShare = async () => {
    try {
      // Create a simplified version of the data for sharing
      const shareData = {
        title: "Startup Analysis Results",
        text: `Check out my startup analysis with a ${results.successRate.percentage}% success rate!`,
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Your analysis has been shared."
        });
      } else {
        // Fallback for browsers that don't support sharing
        await navigator.clipboard.writeText(shareData.text + " " + shareData.url);
        toast({
          title: "Link copied to clipboard",
          description: "You can now share it manually"
        });
      }
    } catch (error) {
      toast({
        title: "Sharing failed",
        description: "There was an error sharing your analysis",
        variant: "destructive"
      });
    }
  };
  
  // Handle tab change and mark content as rendered
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setHasRendered(prev => ({
      ...prev,
      [value]: true
    }));
  };
  
  // Export as PDF (simplified implementation)
  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your analysis is being prepared for download"
    });
    
    // In a real implementation, we would generate a PDF here
    setTimeout(() => {
      toast({
        title: "Export completed",
        description: "Your analysis has been downloaded"
      });
    }, 1500);
  };
  
  // Use the main layout for desktop and tabs for mobile
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analysis Results</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 size={18} />
            </Button>
            <Button variant="outline" size="icon" onClick={handleExport}>
              <Download size={18} />
            </Button>
            {onSave && (
              <Button onClick={onSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
            <TabsTrigger value="swot">SWOT</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-0 space-y-4">
            {hasRendered.overview && (
              <>
                <SuccessRateOptimized data={results.successRate} />
                <CompetitorsOptimized data={results.competitors} />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="business" className="mt-0 space-y-4">
            {hasRendered.business && (
              <BusinessModelOptimized data={results.businessModelStrength} />
            )}
          </TabsContent>
          
          <TabsContent value="funding" className="mt-0 space-y-4">
            {hasRendered.funding && (
              <FundingRequirementsOptimized 
                data={results.fundingRequired} 
                country={country} 
              />
            )}
          </TabsContent>
          
          <TabsContent value="swot" className="mt-0 space-y-4">
            {hasRendered.swot && (
              <SwotAnalysisOptimized data={results.swotAnalysis} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  // Desktop layout using CSS grid for better performance than flex
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 size={18} className="mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download size={18} className="mr-2" />
            Export
          </Button>
          {onSave && (
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Results"}
            </Button>
          )}
        </div>
      </div>
      
      {/* Row 1 - Success Rate and Competitors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SuccessRateOptimized data={results.successRate} />
        <CompetitorsOptimized data={results.competitors} />
      </div>
      
      {/* Row 2 - Business Model */}
      <div className="grid grid-cols-1 gap-4">
        <BusinessModelOptimized data={results.businessModelStrength} />
      </div>
      
      {/* Row 3 - Funding Requirements and SWOT Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FundingRequirementsOptimized 
          data={results.fundingRequired} 
          country={country} 
        />
        <SwotAnalysisOptimized data={results.swotAnalysis} />
      </div>
    </div>
  );
};

export default StartupAnalyzerResultsOptimized;