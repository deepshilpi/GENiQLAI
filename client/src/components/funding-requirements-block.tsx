import { AnalysisResults } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface FundingRequirementsBlockProps {
  fundingRequired: AnalysisResults["fundingRequired"];
}

export function FundingRequirementsBlock({ fundingRequired }: FundingRequirementsBlockProps) {
  if (!fundingRequired) {
    return (
      <div className="bg-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Funding Requirements</h3>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <i className="fas fa-dollar-sign text-primary"></i>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Funding requirements data is not available.
        </div>
      </div>
    );
  }

  // Calculate breakdown percentages for the progress bars
  const totalPercent = fundingRequired.breakdown.reduce((acc, item) => acc + item.percentage, 0);
  const normalizedBreakdown = fundingRequired.breakdown.map(item => ({
    ...item,
    normalizedPercentage: totalPercent > 0 ? (item.percentage / totalPercent) * 100 : 0
  }));

  return (
    <div className="bg-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Funding Requirements</h3>
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
          <i className="fas fa-dollar-sign text-primary"></i>
        </div>
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Total Required</div>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(fundingRequired.total, fundingRequired.currency, undefined, true)}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {normalizedBreakdown.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{item.category}</span>
              <span className="text-sm font-medium">
                {formatCurrency(item.amount, fundingRequired.currency, undefined, true)} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full bg-accent rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full" 
                style={{ width: `${item.normalizedPercentage}%` }}
              ></div>
            </div>
            
            {item.keyExpenses && item.keyExpenses.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.keyExpenses.map((expense, i) => (
                  <span key={i} className="text-xs bg-accent px-2 py-0.5 rounded-full">
                    {expense}
                  </span>
                ))}
              </div>
            )}
            
            {item.timeline && (
              <div className="text-xs text-muted-foreground mt-1">
                Timeline: {item.timeline}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {fundingRequired.fundingStages && fundingRequired.fundingStages.length > 0 && (
        <div className="mt-5 space-y-2">
          <h4 className="text-sm font-medium">Funding Stages</h4>
          <div className="space-y-3">
            {fundingRequired.fundingStages.map((stage, index) => (
              <div key={index} className="bg-accent/30 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{stage.stage}</span>
                  <span className="text-sm font-bold">
                    {formatCurrency(stage.amount, fundingRequired.currency, undefined, true)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Timeline: {stage.timeline}
                </div>
                
                {stage.milestones && stage.milestones.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs font-medium">Key Milestones:</div>
                    <ul className="list-disc list-inside text-xs text-muted-foreground">
                      {stage.milestones.map((milestone, i) => (
                        <li key={i}>{milestone}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-3 text-sm text-muted-foreground">
        {fundingRequired.message}
      </div>
    </div>
  );
}