import { Landmark, Globe, Mail, Phone, DollarSign, ExternalLink, Tag } from 'lucide-react';

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

export function FundingInvestors({ investors, message }: FundingInvestorsProps) {
  // Sort investors by portfolio fit (descending)
  const sortedInvestors = [...investors].sort((a, b) => b.portfolioFit - a.portfolioFit);
  
  // Get portfolio fit color
  const getFitColor = (fit: number): string => {
    return fit >= 80 ? "text-green-400 bg-green-500/10 border-green-500/20" :
           fit >= 60 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
           fit >= 40 ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
           fit >= 20 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
           "text-red-400 bg-red-500/10 border-red-500/20";
  };
  
  // Get portfolio fit level
  const getFitLevel = (fit: number): string => {
    return fit >= 80 ? "Excellent Fit" :
           fit >= 60 ? "Strong Fit" :
           fit >= 40 ? "Good Fit" :
           fit >= 20 ? "Moderate Fit" :
           "Limited Fit";
  };

  return (
    <div className="flex flex-col">
      <div className="p-3 mb-4 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
        <div className="flex items-center mb-2">
          <Landmark className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Investment Opportunities</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
      
      {/* Investors cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {sortedInvestors.map((investor, index) => (
          <div 
            key={index}
            className="rounded-md border border-vision-purple-200/20 overflow-hidden"
          >
            {/* Investor header */}
            <div className="p-3 bg-vision-purple-100/10 border-b border-vision-purple-200/20">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-md font-medium text-white">{investor.name}</h4>
                  <p className="text-sm text-primary">{investor.firm}</p>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${getFitColor(investor.portfolioFit)}`}>
                  {investor.portfolioFit}% - {getFitLevel(investor.portfolioFit)}
                </div>
              </div>
            </div>
            
            {/* Investor details */}
            <div className="p-3">
              {/* Location */}
              <div className="flex items-center mb-2 text-sm text-white/80">
                <Globe className="w-4 h-4 mr-2 text-blue-400" />
                <span>{investor.location}</span>
              </div>
              
              {/* Contact info if available */}
              {investor.contactInfo && (
                <div className="flex items-center mb-3 text-sm text-white/80">
                  {investor.contactInfo.includes('@') ? (
                    <Mail className="w-4 h-4 mr-2 text-amber-400" />
                  ) : (
                    <Phone className="w-4 h-4 mr-2 text-green-400" />
                  )}
                  <span>{investor.contactInfo}</span>
                </div>
              )}
              
              {/* Investment focus */}
              <div className="mb-2">
                <h5 className="text-xs text-white/60 mb-1.5 flex items-center">
                  <DollarSign className="w-3.5 h-3.5 mr-1" />
                  Investment Focus
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {investor.investmentFocus.map((focus, focusIndex) => (
                    <span 
                      key={focusIndex}
                      className="text-xs px-1.5 py-0.5 rounded-full bg-vision-purple-100/10 border border-vision-purple-200/20 text-white/80 flex items-center"
                    >
                      <Tag className="w-3 h-3 mr-1 text-primary" />
                      {focus}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Fake crunchbase link for illustration */}
              <a 
                href="#"
                className="mt-2 text-xs flex items-center text-primary hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                View Investor Profile
              </a>
            </div>
            
            {/* Portfolio fit bar */}
            <div className="w-full bg-vision-purple-100/10 h-1">
              <div 
                className="h-1" 
                style={{ 
                  width: `${investor.portfolioFit}%`,
                  backgroundColor: investor.portfolioFit >= 60 ? '#22c55e' : 
                                  investor.portfolioFit >= 40 ? '#3b82f6' : 
                                  investor.portfolioFit >= 20 ? '#f59e0b' : 
                                  '#ef4444'
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-xs text-center text-white/60">
        <p>Note: This information is for illustrative purposes only and should be verified manually before contacting.</p>
      </div>
    </div>
  );
}