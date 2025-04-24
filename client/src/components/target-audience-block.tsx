import { AnalysisResults } from "@shared/schema";
import { Progress } from "./ui/progress";

interface TargetAudienceBlockProps {
  targetAudienceFit: AnalysisResults["targetAudienceFit"];
}

export function TargetAudienceBlock({ targetAudienceFit }: TargetAudienceBlockProps) {
  if (!targetAudienceFit.segments || targetAudienceFit.segments.length === 0) {
    return (
      <div className="bg-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Target Audience Fit</h3>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <i className="fas fa-users text-primary"></i>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Target audience data is not available.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Target Audience Fit</h3>
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
          <i className="fas fa-users text-primary"></i>
        </div>
      </div>
      
      <div className="space-y-4">
        {targetAudienceFit.segments.map((segment, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">{segment.name}</span>
              <span className="text-sm font-bold">{segment.score}%</span>
            </div>
            <Progress value={segment.score} className="h-2" />
            
            {segment.behaviorsAndPreferences && segment.behaviorsAndPreferences.length > 0 && (
              <div className="bg-accent/30 p-2 rounded text-xs space-y-1 mt-1">
                <div className="font-medium">Key Behaviors & Preferences:</div>
                <ul className="list-disc list-inside space-y-1">
                  {segment.behaviorsAndPreferences.slice(0, 3).map((behavior, i) => (
                    <li key={i} className="text-muted-foreground">{behavior}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-sm text-muted-foreground">
        {targetAudienceFit.message}
      </div>
    </div>
  );
}