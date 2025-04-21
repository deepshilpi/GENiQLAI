import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  PieChart, 
  TrendingUp, 
  Lightbulb, 
  Users, 
  AlertTriangle,
  DollarSign,
  BarChart,
  Target
} from 'lucide-react';
import { useLocation } from 'wouter';

// Sample analysis data
const SAMPLE_ANALYSES = [
  {
    id: 'saas',
    title: 'AI-Powered Project Management SaaS',
    description: 'A SaaS product that uses AI to automate project management tasks, resource allocation, and timeline predictions.',
    successRate: 72,
    competitors: [
      { name: 'Monday.com', marketShare: 28 },
      { name: 'Asana', marketShare: 22 },
      { name: 'ClickUp', marketShare: 18 },
      { name: 'Trello', marketShare: 15 },
    ],
    marketViability: [
      { title: 'Growing market', subtitle: 'Project management tools growing at 10% YoY', type: 'success' },
      { title: 'Competitive space', subtitle: 'Many established players with strong market positions', type: 'warning' },
      { title: 'AI differentiation', subtitle: 'AI features provide strong competitive advantage', type: 'success' },
    ],
    cagrData: {
      industryAverage: 10,
      potential: 24,
      years: ['2026', '2027', '2028', '2029', '2030']
    }
  },
  {
    id: 'fintech',
    title: 'Automated Investment Platform for Gen Z',
    description: 'A mobile app that helps Gen Z automatically invest spare change and small amounts with AI-powered portfolio management.',
    successRate: 68,
    competitors: [
      { name: 'Robinhood', marketShare: 32 },
      { name: 'Acorns', marketShare: 21 },
      { name: 'Stash', marketShare: 19 },
      { name: 'Public.com', marketShare: 12 },
    ],
    marketViability: [
      { title: 'Growing audience', subtitle: 'Gen Z investing is increasing rapidly', type: 'success' },
      { title: 'Regulatory challenges', subtitle: 'Fintech faces strict compliance requirements', type: 'warning' },
      { title: 'Low barriers to switch', subtitle: 'Users can easily move between platforms', type: 'danger' },
    ],
    cagrData: {
      industryAverage: 14,
      potential: 28,
      years: ['2026', '2027', '2028', '2029', '2030']
    }
  },
  {
    id: 'ecommerce',
    title: 'Sustainable Home Goods Marketplace',
    description: 'An e-commerce platform exclusively for sustainable, eco-friendly home goods with carbon footprint tracking.',
    successRate: 76,
    competitors: [
      { name: 'Wayfair', marketShare: 30 },
      { name: 'Etsy', marketShare: 25 },
      { name: 'Made.com', marketShare: 15 },
      { name: 'EarthHero', marketShare: 10 },
    ],
    marketViability: [
      { title: 'Growing eco-consciousness', subtitle: 'Sustainable products seeing 15% YoY market growth', type: 'success' },
      { title: 'Price sensitivity', subtitle: 'Consumers often choose cheaper non-sustainable alternatives', type: 'warning' },
      { title: 'Supplier verification', subtitle: 'Ensuring suppliers meet sustainability claims is challenging', type: 'warning' },
    ],
    cagrData: {
      industryAverage: 11,
      potential: 22,
      years: ['2026', '2027', '2028', '2029', '2030']
    }
  }
];

export function SampleAnalysisDemo() {
  const [_, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState<string>(SAMPLE_ANALYSES[0].id);
  
  const currentAnalysis = SAMPLE_ANALYSES.find(a => a.id === selectedTab) || SAMPLE_ANALYSES[0];
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Sample Startup Analysis</h2>
        <p className="text-white/70">
          Explore sample analyses to see how GENIQL can help evaluate your startup idea
        </p>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="bg-vision-card/50 border border-vision-purple-200/20 p-1 w-full flex mb-6">
          {SAMPLE_ANALYSES.map(analysis => (
            <TabsTrigger 
              key={analysis.id}
              value={analysis.id}
              className="flex-1 text-white data-[state=active]:bg-vision-primary-gradient data-[state=active]:text-white"
            >
              {analysis.title.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {SAMPLE_ANALYSES.map(analysis => (
          <TabsContent key={analysis.id} value={analysis.id} className="outline-none">
            <div className="vision-card p-4 sm:p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-2">{analysis.title}</h3>
              <p className="text-white/80">{analysis.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Success Rate */}
              <div className="vision-card p-4 sm:p-6 flex flex-col">
                <div className="flex items-center mb-4">
                  <PieChart className="w-5 h-5 text-vision-purple-500 mr-2" />
                  <h4 className="text-lg font-bold text-white">Success Rate</h4>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative w-32 h-32 mb-4">
                    <div className="absolute inset-0 rounded-full border-8 border-vision-purple-100/20"></div>
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-vision-primary-gradient"
                      style={{ clipPath: `inset(0 ${100 - analysis.successRate}% 0 0)` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{analysis.successRate}%</span>
                    </div>
                  </div>
                  <p className="text-center text-white/70">
                    This idea has a {analysis.successRate}% chance of success based on market conditions and execution strategy.
                  </p>
                </div>
              </div>
              
              {/* Competitors */}
              <div className="vision-card p-4 sm:p-6 flex flex-col">
                <div className="flex items-center mb-4">
                  <Users className="w-5 h-5 text-vision-purple-500 mr-2" />
                  <h4 className="text-lg font-bold text-white">Market Competitors</h4>
                </div>
                <div className="flex-1">
                  {analysis.competitors.map((competitor, index) => (
                    <div key={index} className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-white/80">{competitor.name}</span>
                        <span className="text-white font-medium">{competitor.marketShare}%</span>
                      </div>
                      <div className="h-2 w-full bg-vision-purple-100/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-vision-primary-gradient" 
                          style={{ width: `${competitor.marketShare}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <p className="text-white/70 text-sm mt-4">
                    The market has established players but room for disruption with the right approach.
                  </p>
                </div>
              </div>
              
              {/* Market Viability */}
              <div className="vision-card p-4 sm:p-6 flex flex-col">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-5 h-5 text-vision-purple-500 mr-2" />
                  <h4 className="text-lg font-bold text-white">Market Viability</h4>
                </div>
                <div className="flex-1">
                  {analysis.marketViability.map((point, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="flex items-start">
                        <div className={`w-3 h-3 rounded-full mt-1 mr-3 ${
                          point.type === 'success' ? 'bg-green-500' : 
                          point.type === 'warning' ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}></div>
                        <div>
                          <h5 className="text-white font-medium">{point.title}</h5>
                          <p className="text-white/70 text-sm">{point.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* CAGR Analysis */}
              <div className="vision-card p-4 sm:p-6 flex flex-col col-span-1 md:col-span-3">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 text-vision-purple-500 mr-2" />
                  <h4 className="text-lg font-bold text-white">Growth Projection (CAGR)</h4>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-vision-purple-700 mr-2"></div>
                    <span className="text-white/70">Potential: {analysis.cagrData.potential}%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-white/70">Industry Average: {analysis.cagrData.industryAverage}%</span>
                  </div>
                </div>
                <div className="h-48 sm:h-64 w-full">
                  <div className="h-full w-full bg-vision-purple-100/10 rounded-lg p-2 sm:p-4 flex items-end">
                    {analysis.cagrData.years.map((year, index) => {
                      // Create simulated growing data points
                      const industryValue = analysis.cagrData.industryAverage * (1 + index * 0.2);
                      const potentialValue = analysis.cagrData.potential * (1 + index * 0.25);
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center h-full">
                          <div className="flex-1 w-full flex items-end justify-center space-x-2">
                            <div 
                              className="w-3 bg-blue-500 rounded-t-sm" 
                              style={{ 
                                height: `${(industryValue / potentialValue) * 80}%` 
                              }}
                            ></div>
                            <div 
                              className="w-3 bg-vision-purple-700 rounded-t-sm" 
                              style={{ 
                                height: `80%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-white/50 mt-2">{year}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-white/70 mb-4">Ready to analyze your own startup idea?</p>
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-vision-primary-gradient hover:brightness-110 transition-all text-white font-medium"
              >
                Sign Up to Create Your Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}