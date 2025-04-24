import React, { memo } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedCard } from "./optimized-card";
import { ExternalLink, Trophy, TrendingUp } from "lucide-react";
import { AnalysisResults } from "@shared/schema";

interface CompetitorsProps {
  data: AnalysisResults["competitors"];
  isLoading?: boolean;
}

// Use a simple, static bar chart instead of complex interactive components
const SimpleBarChart = ({ 
  competitors = [] 
}: { 
  competitors: Array<{ name: string; marketShare: number }> 
}) => {
  // Find the maximum market share for scaling
  const maxShare = Math.max(...competitors.map(c => c.marketShare), 20);
  
  return (
    <div className="mt-2 space-y-2 h-[200px] flex flex-col justify-end">
      <div className="grid grid-cols-6 h-full items-end gap-2">
        {competitors.slice(0, 6).map((competitor, i) => {
          const height = `${Math.max((competitor.marketShare / maxShare) * 100, 10)}%`;
          
          return (
            <div key={i} className="flex flex-col items-center h-full justify-end">
              <div 
                className="w-full bg-primary/80 rounded-t-sm" 
                style={{ height }}
              />
              <div className="text-xs mt-1 truncate max-w-full text-center" title={competitor.name}>
                {competitor.name.length > 10 ? `${competitor.name.slice(0, 8)}...` : competitor.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Optimized competitor component using memo to prevent unnecessary re-renders
const CompetitorsOptimized = memo(({ data, isLoading = false }: CompetitorsProps) => {
  if (!data && !isLoading) return null;

  const { 
    competitors = [],
    message = "" 
  } = data || {};

  // Sort competitors by market share for better visualization
  const sortedCompetitors = [...(competitors || [])].sort((a, b) => b.marketShare - a.marketShare);
  
  // Get market leader
  const marketLeader = sortedCompetitors[0] || null;

  return (
    <OptimizedCard 
      variant="default" 
      isLoading={isLoading}
      className="h-full"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium flex items-center">
          <span className="bg-primary/10 rounded-full p-1.5 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 2v5"/>
              <path d="M8 2v5"/>
              <path d="M12 18v-6"/>
              <path d="M9 15l3 3 3-3"/>
            </svg>
          </span>
          Competitors & Market Share
        </CardTitle>
      </CardHeader>
      <CardContent>
        {marketLeader && (
          <div className="mb-4">
            <h3 className="text-sm font-medium flex items-center">
              <Trophy size={16} className="text-yellow-500 mr-1.5" /> Market Leader
            </h3>
            <div className="flex items-center justify-between mt-1">
              <div className="font-medium">{marketLeader.name}</div>
              <div className="text-primary font-medium">{marketLeader.marketShare}% Market Share</div>
            </div>
            {marketLeader.websiteUrl && (
              <a 
                href={marketLeader.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground flex items-center mt-1 hover:text-primary transition-colors"
              >
                {marketLeader.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}
                <ExternalLink size={12} className="ml-1" />
              </a>
            )}
          </div>
        )}

        {/* Simple static bar chart */}
        <SimpleBarChart competitors={sortedCompetitors} />

        {/* Market opportunity message */}
        {message && (
          <div className="mt-4 pt-3 border-t border-border/30">
            <h3 className="text-sm font-medium flex items-center">
              <TrendingUp size={16} className="text-primary mr-1.5" /> Market Opportunity
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
        )}
      </CardContent>
    </OptimizedCard>
  );
});

CompetitorsOptimized.displayName = "CompetitorsOptimized";

export default CompetitorsOptimized;