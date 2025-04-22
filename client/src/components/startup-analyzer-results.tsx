import { AnalysisResults } from "@shared/schema";
import { SuccessRateChart } from "./success-rate-chart";
import { CompetitorChart } from "./competitor-chart";
import { CagrChart } from "./cagr-chart";
import { BlurOverlay } from "./ui/blur-overlay";
import { formatCurrency } from "@/lib/utils";

interface StartupAnalyzerResultsProps {
  results: AnalysisResults;
  userPlan: string;
}

export function StartupAnalyzerResults({ results, userPlan }: StartupAnalyzerResultsProps) {
  const needsProPlan = userPlan === "free";
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Startup Analysis</h2>
        <div className="text-sm text-muted-foreground">
          <span className="text-primary">Pro tip:</span> Be specific with your idea for better results
        </div>
      </div>
      
      {/* Analysis Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Block 1: Success Rate */}
        {results.successRate && (
          <div className="bg-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Success Rate</h3>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <i className="fas fa-chart-pie text-primary"></i>
              </div>
            </div>
            
            <div className="flex justify-center">
              <SuccessRateChart percentage={results.successRate.percentage} />
            </div>
            
            <div className="mt-3 text-sm text-muted-foreground">
              {results.successRate.message}
            </div>
          </div>
        )}
        
        {/* Block 2: Competitors */}
        {results.competitors && (
          <div className="bg-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Competitors</h3>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <i className="fas fa-users text-primary"></i>
              </div>
            </div>
            
            <div className="space-y-3">
              {results.competitors.competitors.slice(0, 3).map((competitor, index) => (
                <CompetitorChart 
                  key={index} 
                  name={competitor.name} 
                  marketShare={competitor.marketShare}
                  index={index}
                />
              ))}
            </div>
            
            <div className="mt-3 text-sm text-muted-foreground">
              {results.competitors.message}
            </div>
          </div>
        )}
        
        {/* Block 3: Market Viability */}
        {results.marketViability && (
          <div className="bg-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Market Viability</h3>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <i className="fas fa-check-circle text-primary"></i>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              {results.marketViability.points.map((point, index) => (
                <div key={index} className="bg-accent rounded-lg p-3 flex items-center">
                  <div className={`w-8 h-8 rounded-full bg-${point.type === 'success' ? 'success' : point.type === 'warning' ? 'warning' : 'destructive'} bg-opacity-20 flex items-center justify-center mr-3`}>
                    <i className={`fas fa-${point.type === 'success' ? 'check' : point.type === 'warning' ? 'exclamation' : 'times'} text-${point.type === 'success' ? 'success' : point.type === 'warning' ? 'warning' : 'destructive'}`}></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{point.title}</div>
                    <div className="text-xs text-muted-foreground">{point.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Block 4: Unique Value Proposition */}
        {results.uniqueValueProposition && (
          <div className="bg-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Unique Value Proposition</h3>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <i className="fas fa-star text-primary"></i>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-primary bg-opacity-5 border-l-4 border-primary rounded p-3">
                <div className="text-sm">{results.uniqueValueProposition.differentiator}</div>
              </div>
              
              <h4 className="font-medium text-sm">Strengths:</h4>
              <ul className="space-y-2 text-sm">
                {results.uniqueValueProposition.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-check-circle text-success mt-1 mr-2"></i>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Block 5: CAGR (Pro) */}
        {results.cagr && (
          <div className="bg-card rounded-xl p-5 relative">
            {needsProPlan && (
              <BlurOverlay 
                feature="CAGR Analysis" 
                requiredPlan="pro"
                description="Access detailed compound annual growth rate projections for your startup"
              />
            )}
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">CAGR</h3>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <i className="fas fa-chart-line text-primary"></i>
              </div>
            </div>
            
            <div className="chart-container h-48">
              <CagrChart data={results.cagr.data} />
            </div>
            
            <div className="mt-3 flex justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Industry Average</div>
                <div className="text-xl font-bold">{results.cagr.industryAverage.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Your Potential</div>
                <div className="text-xl font-bold text-success">{results.cagr.potential.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Block 6: Previous Failed Executions (Pro) */}
        {results.previousFailedExecutions && (
          <div className="bg-card rounded-xl p-5 relative">
            {needsProPlan && (
              <BlurOverlay 
                feature="Failed Executions Analysis" 
                requiredPlan="pro"
                description="Learn from past mistakes - access data on similar startups that failed"
              />
            )}
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Previous Failed Executions</h3>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-warning"></i>
              </div>
            </div>
            
            <div className="space-y-3">
              {results.previousFailedExecutions.failures.map((failure, index) => (
                <div key={index} className="border border-border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{failure.name}</h4>
                    <span className="text-xs bg-destructive bg-opacity-20 text-destructive px-2 py-0.5 rounded">{failure.year}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{failure.reason}</p>
                </div>
              ))}
              
              <div className="text-sm text-muted-foreground mt-2">
                <i className="fas fa-info-circle mr-1"></i> {results.previousFailedExecutions.message}
              </div>
            </div>
          </div>
        )}
        
        {/* Block 7: Funding Requirements (Pro) */}
        {results.fundingRequirements && (
          <div className="bg-card rounded-xl p-5 relative">
            {needsProPlan && (
              <BlurOverlay 
                feature="Funding Requirements" 
                requiredPlan="pro"
                description="Get detailed funding requirements and capital allocation recommendations"
              />
            )}
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Funding Requirements</h3>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <i className="fas fa-dollar-sign text-primary"></i>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">Seed Round</div>
                <div className="text-sm font-bold">
                  {formatCurrency(results.fundingRequirements.seedRound.min)} - 
                  {formatCurrency(results.fundingRequirements.seedRound.max)}
                </div>
              </div>
              <div className="w-full bg-accent rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: "30%" }}></div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="text-sm">Series A ({results.fundingRequirements.seriesA.timeframe})</div>
                <div className="text-sm font-bold">
                  {formatCurrency(results.fundingRequirements.seriesA.min)} - 
                  {formatCurrency(results.fundingRequirements.seriesA.max)}
                </div>
              </div>
              <div className="w-full bg-accent rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: "60%" }}></div>
              </div>
              
              <div className="bg-accent rounded-lg p-3 mt-3">
                <div className="text-sm font-medium">Capital Allocation</div>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Product Dev</div>
                    <div className="text-sm font-bold">
                      {results.fundingRequirements.allocation.productDevelopment}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Marketing</div>
                    <div className="text-sm font-bold">
                      {results.fundingRequirements.allocation.marketing}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Operations</div>
                    <div className="text-sm font-bold">
                      {results.fundingRequirements.allocation.operations}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Block 8: Go-to-Market Strategy (Pro) */}
        {results.goToMarketStrategy && (
          <div className="bg-card rounded-xl p-5 relative">
            {needsProPlan && (
              <BlurOverlay 
                feature="Go-to-Market Strategy" 
                requiredPlan="pro"
                description="Access a detailed execution roadmap with timelines and action steps"
              />
            )}
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Go-to-Market Strategy</h3>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <i className="fas fa-rocket text-primary"></i>
              </div>
            </div>
            
            <div className="space-y-3">
              {results.goToMarketStrategy.steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center mr-3">
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{step.name}</div>
                    <div className="text-xs text-muted-foreground">{step.timeframe}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
