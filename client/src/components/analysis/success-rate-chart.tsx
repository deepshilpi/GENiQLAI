import { useEffect, useRef } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface SuccessRateChartProps {
  percentage: number;
  message: string;
}

export function SuccessRateChart({ percentage, message }: SuccessRateChartProps) {
  const gaugeRef = useRef<HTMLDivElement>(null);
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));

  // Extract positive and negative points from the message
  const points = message.split(/\.|!/).filter(point => point.trim().length > 0);
  const positivePoints = points.filter(point => 
    point.toLowerCase().includes("advantage") || 
    point.toLowerCase().includes("strength") || 
    point.toLowerCase().includes("opportunity") ||
    point.toLowerCase().includes("potential") ||
    point.toLowerCase().includes("positive")
  );
  const negativePoints = points.filter(point => 
    point.toLowerCase().includes("challenge") || 
    point.toLowerCase().includes("weakness") || 
    point.toLowerCase().includes("threat") ||
    point.toLowerCase().includes("risk") ||
    point.toLowerCase().includes("concern") ||
    point.toLowerCase().includes("negative")
  );
  
  const otherPoints = points.filter(point => 
    !positivePoints.includes(point) && !negativePoints.includes(point)
  );

  // If we couldn't identify clear positive/negative points, use first half as positive, second half as negative
  const finalPositivePoints = positivePoints.length > 0 ? positivePoints : [...otherPoints.slice(0, Math.ceil(otherPoints.length / 2))];
  const finalNegativePoints = negativePoints.length > 0 ? negativePoints : [...otherPoints.slice(Math.ceil(otherPoints.length / 2))];

  // Set the gauge value
  useEffect(() => {
    if (gaugeRef.current) {
      const angle = (normalizedPercentage / 100) * 180 - 90;
      gaugeRef.current.style.transform = `rotate(${angle}deg)`;
    }
  }, [normalizedPercentage]);

  // Get the color based on the percentage
  const getColor = () => {
    if (normalizedPercentage < 30) return "rgb(239, 68, 68)"; // Red
    if (normalizedPercentage < 70) return "rgb(234, 179, 8)"; // Yellow
    return "rgb(34, 197, 94)"; // Green
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-center mb-6">
        <div className="relative w-40 h-40">
          {/* Gauge background */}
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-[16px] border-vision-purple-200/10"></div>
          
          {/* Gauge indicator */}
          <div 
            ref={gaugeRef}
            className="absolute top-0 left-1/2 w-[4px] h-[50%] bg-white origin-bottom rounded-t-full transition-transform duration-1000 ease-out"
            style={{ transform: "rotate(-90deg)" }}
          >
            <div 
              className="absolute top-0 left-1/2 w-4 h-4 -ml-2 -mt-2 rounded-full shadow-md transition-colors duration-1000"
              style={{ backgroundColor: getColor() }}
            ></div>
          </div>
          
          {/* Percentage display */}
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col">
            <div 
              className="text-3xl font-bold transition-colors duration-1000"
              style={{ color: getColor() }}
            >
              {normalizedPercentage}%
            </div>
            <div className="text-xs text-white/70">Success Rate</div>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Positive Points */}
        <div className="p-3 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
          <div className="flex items-center mb-2">
            <ThumbsUp className="w-4 h-4 mr-2 text-green-500" />
            <h4 className="text-sm font-medium text-white">Strengths</h4>
          </div>
          <ul className="pl-6 space-y-1 list-disc">
            {finalPositivePoints.map((point, index) => (
              <li key={index} className="text-sm text-white/80">
                {point.trim()}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Negative Points */}
        <div className="p-3 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
          <div className="flex items-center mb-2">
            <ThumbsDown className="w-4 h-4 mr-2 text-red-500" />
            <h4 className="text-sm font-medium text-white">Challenges</h4>
          </div>
          <ul className="pl-6 space-y-1 list-disc">
            {finalNegativePoints.map((point, index) => (
              <li key={index} className="text-sm text-white/80">
                {point.trim()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}