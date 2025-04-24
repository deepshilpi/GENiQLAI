import { AnalysisResults } from "@shared/schema";
import { MarketSizeChart } from "./market-size-chart";
import { Badge } from "./ui/badge";
import { getCountryFlag } from "@/lib/utils";

interface MarketSizeBlockProps {
  marketSize: AnalysisResults["marketSize"];
  country: string;
}

export function MarketSizeBlock({ marketSize, country }: MarketSizeBlockProps) {
  if (!marketSize.segments || marketSize.segments.length === 0) {
    return (
      <div className="bg-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Market Size Analysis</h3>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <i className="fas fa-chart-pie text-primary"></i>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Market size data is not available.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Market Size Analysis</h3>
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
          <i className="fas fa-chart-pie text-primary"></i>
        </div>
      </div>
      
      <div className="flex justify-center">
        <MarketSizeChart 
          segments={marketSize.segments} 
          totalSize={marketSize.totalSize} 
          currency={marketSize.currency || "USD"}
        />
      </div>
      
      <div className="mt-4 space-y-2">
        {marketSize.segments.map((segment, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 bg-[rgba(117,81,255,${0.8 - (index * 0.15)})]`}></div>
            <div className="text-sm">{segment.name}</div>
          </div>
        ))}
      </div>
      
      {marketSize.countryInsights && (
        <div className="mt-4 p-3 bg-accent/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-6 w-6 items-center justify-center">
              {getCountryFlag(country)}
            </div>
            <span className="font-medium">Market Analysis: {country}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {marketSize.message}
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <div className="text-xs text-muted-foreground">Currency:</div>
              <div className="text-sm font-medium">
                {marketSize.countryInsights.currency} ({marketSize.currency})
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Market Growth Rate:</div>
              <div className="text-sm font-medium">
                {marketSize.countryInsights.marketGrowthRate}% YoY
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}