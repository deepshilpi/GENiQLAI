import React, { memo } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedCard } from "./optimized-card";
import { AnalysisResults } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SwotAnalysisProps {
  data: AnalysisResults["swotAnalysis"];
  isLoading?: boolean;
}

// SWOT item component
const SwotItem = ({ 
  title, 
  items = [], 
  icon,
  colorClass 
}: { 
  title: string;
  items: string[];
  icon: React.ReactNode;
  colorClass: string;
}) => {
  return (
    <div className={cn("rounded-md p-3", colorClass)}>
      <h3 className="font-medium text-sm flex items-center mb-2">
        <span className="mr-1.5">{icon}</span>
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm flex items-start">
            <span className="text-xs mr-2 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// SWOT analysis component using memo to prevent unnecessary re-renders
const SwotAnalysisOptimized = memo(({ data, isLoading = false }: SwotAnalysisProps) => {
  if (!data && !isLoading) return null;

  const { 
    strengths = [], 
    weaknesses = [], 
    opportunities = [], 
    threats = [],
    priorityActions = []
  } = data || {};

  // Simplified SVG icons
  const strengthsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3a8 8 0 0 0-8 8m0 0a8 8 0 0 0 8 8m-8-8h16"/>
    </svg>
  );

  const weaknessesIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 21v-8.2a3 3 0 0 0-4.8-2.4"/>
      <path d="M14 10.8a3 3 0 0 0 4.8-2.4"/>
      <path d="M8 22h8"/>
      <path d="M5 14h2"/>
      <path d="M17 4v2"/>
      <path d="M15 5.6l1.8-1.2"/>
      <path d="M11 6.8 9.2 8"/>
    </svg>
  );

  const opportunitiesIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 12 5.25 5c1.31 1 3.13 1 4.44 0l8.16-6.22a5.31 5.31 0 0 0 2.06-4.09C22 4.08 19.12 2 15.15 2a7.64 7.64 0 0 0-5.53 2.16L7.5 6"/>
    </svg>
  );

  const threatsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8.99V9"/>
      <path d="M12 12.76a6 6 0 0 0 9-1.15l-3-5.19a6 6 0 0 0-10.29 0l-1.92 3.32c-.75 1.3-.22 2.92 1.09 3.54z"/>
      <path d="m15.54 19 .46.8a2 2 0 0 1-.54 2.77A2 2 0 0 1 14 23H8a2 2 0 0 1-1-3.73l5-2.64Z"/>
      <path d="M14.7 14.74a6.05 6.05 0 0 1-5.4 0"/>
    </svg>
  );

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
              <path d="M10 22H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-5"/>
              <path d="M13.4 7 9.6 11l-1-1"/>
              <path d="M13.5 17H17"/>
              <path d="M10 4.99l-2 .002"/>
              <path d="M10 12.99l-2 .002"/>
              <path d="M10 19.99l-2 .002"/>
            </svg>
          </span>
          SWOT Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SwotItem 
            title="Strengths" 
            items={strengths} 
            icon={strengthsIcon}
            colorClass="bg-green-500/10 border border-green-500/20"
          />
          
          <SwotItem 
            title="Weaknesses" 
            items={weaknesses} 
            icon={weaknessesIcon}
            colorClass="bg-red-500/10 border border-red-500/20"
          />
          
          <SwotItem 
            title="Opportunities" 
            items={opportunities} 
            icon={opportunitiesIcon}
            colorClass="bg-blue-500/10 border border-blue-500/20"
          />
          
          <SwotItem 
            title="Threats" 
            items={threats} 
            icon={threatsIcon}
            colorClass="bg-yellow-500/10 border border-yellow-500/20"
          />
        </div>
        
        {/* Priority Actions */}
        {priorityActions && priorityActions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/30">
            <h3 className="font-medium text-sm mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-1.5">
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              Priority Actions
            </h3>
            <ul className="space-y-1.5">
              {priorityActions.map((action, i) => (
                <li key={i} className="text-sm flex items-start">
                  <span className="text-primary font-medium mr-2">{i + 1}.</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </OptimizedCard>
  );
});

SwotAnalysisOptimized.displayName = "SwotAnalysisOptimized";

export default SwotAnalysisOptimized;