import React from "react";
import { DollarSign, Users, MapPin, Briefcase, Tag, Mail, ExternalLink } from "lucide-react";
import { 
  Cell, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  Scatter,
  ScatterChart,
  ZAxis,
  XAxis,
  YAxis
} from "recharts";

interface FundingInvestorsProps {
  investors: Array<{
    name: string;
    firm: string;
    investmentFocus: string[];
    location: string;
    contactInfo?: string;
    portfolioFit: number; // 0-100
  }>;
  message: string;
}

export function FundingInvestors({ investors = [], message = "No funding information available" }: FundingInvestorsProps) {
  // Make sure investors is an array
  const safeInvestors = Array.isArray(investors) ? investors : [];
  
  // Sort investors by portfolio fit (descending)
  const sortedInvestors = [...safeInvestors].sort((a, b) => b.portfolioFit - a.portfolioFit);
  
  // Get top 5 investors for highlighting
  const topInvestors = sortedInvestors.slice(0, 5);
  
  // Prepare data for pie chart (investors by location)
  const getLocationCounts = () => {
    const locationMap = new Map<string, number>();
    
    safeInvestors.forEach(investor => {
      const location = investor.location;
      locationMap.set(location, (locationMap.get(location) || 0) + 1);
    });
    
    return Array.from(locationMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  const locationData = getLocationCounts();
  
  // Prepare data for scatter chart
  const scatterData = safeInvestors.map(investor => ({
    x: investor.portfolioFit,
    y: Math.random() * 60 + 20, // Random y position for visualization
    z: 10, // Size
    name: investor.name,
    firm: investor.firm,
    portfolioFit: investor.portfolioFit
  }));
  
  // Colors for pie chart
  const COLORS = ['#A163F7', '#7551FF', '#0075FF', '#56ABFF', '#CB9FFF'];
  
  // Get color based on portfolio fit
  const getFitColor = (fit: number) => {
    if (fit >= 80) return "#22c55e"; // Excellent fit - green
    if (fit >= 60) return "#0075FF"; // Good fit - blue
    if (fit >= 40) return "#f59e0b"; // Average fit - amber
    return "#ef4444"; // Poor fit - red
  };
  
  // Get text label for portfolio fit
  const getFitLabel = (fit: number) => {
    if (fit >= 80) return "Excellent";
    if (fit >= 60) return "Good";
    if (fit >= 40) return "Average";
    return "Poor";
  };
  
  // Custom tooltip for pie chart
  const renderPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border p-2 rounded-md shadow-md">
          <p className="text-xs font-medium text-white mb-1">{payload[0].name}</p>
          <p className="text-xs text-white/80">
            <span className="font-medium">Investors:</span> {payload[0].value}
          </p>
          <p className="text-xs text-white/80">
            <span className="font-medium">Percentage:</span> {((payload[0].value / safeInvestors.length) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom tooltip for scatter chart
  const renderScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border p-2 rounded-md shadow-md">
          <p className="text-xs font-medium text-white mb-1">{data.name}</p>
          <p className="text-xs text-white/80">
            <span className="font-medium">Firm:</span> {data.firm}
          </p>
          <p className="text-xs text-white/80">
            <span className="font-medium">Portfolio Fit:</span>{" "}
            <span style={{ color: getFitColor(data.portfolioFit) }}>
              {data.portfolioFit}% ({getFitLabel(data.portfolioFit)})
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center mb-2">
        <DollarSign className="w-5 h-5 mr-2 text-primary" />
        <h3 className="text-lg font-medium text-white">Funding & Investment Potential</h3>
      </div>

      {/* Investor portfolio fit visualization */}
      <div className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20">
        <h4 className="text-sm font-medium text-white mb-1">Investor Portfolio Fit</h4>
        <p className="text-xs text-white/70 mb-4">Match percentage with potential investors</p>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Portfolio Fit" 
                unit="%" 
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Axis" 
                tick={false}
                axisLine={false}
              />
              <ZAxis type="number" dataKey="z" range={[60, 400]} />
              <Tooltip content={renderScatterTooltip} />
              <Scatter 
                name="Investors" 
                data={scatterData}
                fill="#A163F7"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Investor location distribution */}
      <div className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20">
        <h4 className="text-sm font-medium text-white mb-1">Geographic Distribution</h4>
        <p className="text-xs text-white/70 mb-3">Investor locations for targeting your fundraising efforts</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={locationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {locationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={renderPieTooltip} />
                <Legend
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right" 
                  wrapperStyle={{ fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-white mb-2">Top Locations</h5>
            {locationData
              .sort((a, b) => b.value - a.value)
              .slice(0, 3)
              .map((location, index) => (
                <div key={index} className="flex items-center p-2 rounded-md bg-vision-purple-100/5">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white">{location.name}</p>
                    <p className="text-xs text-white/70">
                      {location.value} investor{location.value !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="text-xs text-primary">
                    {Math.round((location.value / safeInvestors.length) * 100)}%
                  </p>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Top investor recommendations */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white">Top Recommended Investors</h4>
        
        {topInvestors.map((investor, index) => (
          <div 
            key={index} 
            className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-vision-primary-gradient mr-3">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-white">{investor.name}</h5>
                  <p className="text-xs text-white/70">{investor.firm}</p>
                </div>
              </div>
              <div 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${getFitColor(investor.portfolioFit)}20`,
                  color: getFitColor(investor.portfolioFit)
                }}
              >
                {investor.portfolioFit}% Match
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Location */}
              <div className="flex items-center p-2 rounded-md bg-vision-purple-100/5">
                <MapPin className="h-3.5 w-3.5 text-primary mr-2" />
                <span className="text-xs text-white/80">{investor.location}</span>
              </div>
              
              {/* Contact */}
              {investor.contactInfo && (
                <div className="flex items-center p-2 rounded-md bg-vision-purple-100/5">
                  <Mail className="h-3.5 w-3.5 text-primary mr-2" />
                  <span className="text-xs text-white/80 truncate">{investor.contactInfo}</span>
                </div>
              )}
            </div>
            
            {/* Investment focus */}
            <div className="p-3 bg-vision-purple-100/5 rounded-md">
              <div className="flex items-center mb-2">
                <Briefcase className="h-3.5 w-3.5 text-primary mr-2" />
                <h6 className="text-xs font-medium text-white">Investment Focus</h6>
              </div>
              <div className="flex flex-wrap gap-2">
                {investor.investmentFocus.map((focus, focusIndex) => (
                  <div 
                    key={focusIndex} 
                    className="flex items-center px-2 py-1 rounded-full bg-primary/10"
                  >
                    <Tag className="h-3 w-3 text-primary mr-1" />
                    <span className="text-xs text-primary">{focus}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {/* View all investors button */}
        {safeInvestors.length > 3 && (
          <button className="w-full py-2 flex items-center justify-center rounded-md bg-primary/10 hover:bg-primary/20 transition-colors text-xs text-primary font-medium">
            <ExternalLink className="h-3 w-3 mr-1.5" />
            View All {safeInvestors.length} Potential Investors
          </button>
        )}
      </div>

      {/* Expert insight */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <DollarSign className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Funding Strategy</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}