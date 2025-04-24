import { AnalysisResults } from "@shared/schema";
import { Separator } from "./ui/separator";

interface SwotAnalysisBlockProps {
  swotAnalysis: AnalysisResults["swotAnalysis"];
}

export function SwotAnalysisBlock({ swotAnalysis }: SwotAnalysisBlockProps) {
  if (!swotAnalysis) {
    return (
      <div className="bg-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">SWOT Analysis</h3>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <i className="fas fa-chart-bar text-primary"></i>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          SWOT analysis data is not available.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">SWOT Analysis</h3>
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
          <i className="fas fa-chart-bar text-primary"></i>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-success/10 border-l-4 border-success rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2 text-success">Strengths</h4>
          <ul className="text-xs space-y-1.5">
            {swotAnalysis.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-success mr-1.5">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Weaknesses */}
        <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2 text-destructive">Weaknesses</h4>
          <ul className="text-xs space-y-1.5">
            {swotAnalysis.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <span className="text-destructive mr-1.5">•</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Opportunities */}
        <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2 text-primary">Opportunities</h4>
          <ul className="text-xs space-y-1.5">
            {swotAnalysis.opportunities.map((opportunity, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary mr-1.5">•</span>
                <span>{opportunity}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Threats */}
        <div className="bg-warning/10 border-l-4 border-warning rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2 text-warning">Threats</h4>
          <ul className="text-xs space-y-1.5">
            {swotAnalysis.threats.map((threat, index) => (
              <li key={index} className="flex items-start">
                <span className="text-warning mr-1.5">•</span>
                <span>{threat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Priority Actions */}
      {swotAnalysis.priorityActions && swotAnalysis.priorityActions.length > 0 && (
        <div className="mt-4">
          <Separator className="my-2" />
          <h4 className="font-medium text-sm mb-2">Priority Actions</h4>
          <ul className="text-xs space-y-1.5">
            {swotAnalysis.priorityActions.map((action, index) => (
              <li key={index} className="flex items-start">
                <span className="bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}