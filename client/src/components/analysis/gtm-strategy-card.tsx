import { Compass, Clock, ChevronRight } from "lucide-react";

interface GTMStrategyCardProps {
  steps: Array<{
    name: string;
    timeframe: string;
  }>;
}

export function GTMStrategyCard({ steps }: GTMStrategyCardProps) {
  return (
    <div className="flex flex-col">
      {/* Steps timeline */}
      <div className="relative pl-8 ml-3">
        {steps.map((step, index) => (
          <div key={index} className="relative mb-6">
            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="absolute top-7 left-[-23px] h-full w-0.5 bg-primary/30"></div>
            )}
            
            {/* Step marker */}
            <div className="absolute top-0 left-[-27px] w-6 h-6 bg-vision-primary-gradient rounded-full flex items-center justify-center text-white">
              {index + 1}
            </div>
            
            {/* Step content */}
            <div className="pb-2 border-b border-vision-purple-200/10">
              <div className="mb-1 text-sm font-medium text-white">{step.name}</div>
              <div className="flex items-center text-xs text-white/70">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {step.timeframe}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="mt-2 p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <Compass className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Strategy Summary</h4>
        </div>
        <p className="text-sm text-white/80">
          This {steps.length}-phase go-to-market strategy outlines the key steps to take your startup from concept to market. Follow this roadmap for efficient market entry and customer acquisition.
        </p>
        <div className="mt-3 text-xs text-primary flex items-center cursor-pointer hover:underline">
          <span>View detailed GTM plan</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </div>
      </div>
    </div>
  );
}