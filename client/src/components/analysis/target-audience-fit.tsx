import { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TargetAudienceFitProps {
  segments: Array<{
    name: string;
    score: number;
    maxScore: number;
  }>;
  message: string;
  overallFit: number;
}

export function TargetAudienceFit({ segments, message, overallFit }: TargetAudienceFitProps) {
  const [focusedSegment, setFocusedSegment] = useState<string | null>(null);
  
  const chartData = segments.map(segment => ({
    name: segment.name,
    value: segment.score,
    fullMark: segment.maxScore
  }));
  
  // Format the score as a percentage
  const overallFitPercentage = Math.round(overallFit * 100);
  
  // Determine the color based on the overall fit score
  const getStatusColor = (percentage: number) => {
    if (percentage >= 70) return "bg-green-500/20 text-green-500";
    if (percentage >= 40) return "bg-yellow-500/20 text-yellow-500";
    return "bg-red-500/20 text-red-500";
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70">Overall Target Audience Fit</p>
          <Badge className={`mt-1 px-2 py-1 ${getStatusColor(overallFitPercentage)}`}>
            {overallFitPercentage}% Match
          </Badge>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#ffffff20" />
            <PolarAngleAxis 
              dataKey="name" 
              tick={{ fill: "#ffffff90", fontSize: 12 }} 
              axisLine={{ stroke: "#ffffff30" }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 'dataMax']} 
              axisLine={{ stroke: "#ffffff30" }} 
              tick={{ fill: "#ffffff70", fontSize: 10 }} 
            />
            <Radar
              name="Fit Score"
              dataKey="value"
              stroke="#A163F7"
              fill="#7551FF"
              fillOpacity={0.4}
              onMouseOver={(data) => setFocusedSegment(data.name)}
              onMouseLeave={() => setFocusedSegment(null)}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <Card className="p-2 border-vision-purple-200/30 bg-vision-card backdrop-blur-md">
                      <CardContent className="p-2 text-sm">
                        <p className="font-medium text-white">{data.name}</p>
                        <p className="text-white/70">
                          Score: {data.value} / {data.fullMark}
                        </p>
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {segments.map((segment, index) => (
          <motion.div
            key={index}
            className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-all ${
              focusedSegment === segment.name 
                ? "bg-vision-purple-200/40 text-white" 
                : "bg-vision-purple-100/20 text-white/70 hover:bg-vision-purple-200/30 hover:text-white"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFocusedSegment(focusedSegment === segment.name ? null : segment.name)}
          >
            {segment.name}
          </motion.div>
        ))}
      </div>
      
      <p className="pt-2 text-sm text-white/80 border-t border-vision-purple-200/20">{message}</p>
    </div>
  );
}