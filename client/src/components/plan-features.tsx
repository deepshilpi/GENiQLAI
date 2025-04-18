import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlurOverlay } from "./ui/blur-overlay";
import { useLocation } from "wouter";

export function PlanFeatures() {
  const [initialBudget, setInitialBudget] = useState("");
  const [_, navigate] = useLocation();
  
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const value = e.target.value.replace(/[^0-9]/g, "");
    setInitialBudget(value);
  };
  
  const handleUpgrade = () => {
    navigate("/#pricing");
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Unicorn Plan Features</h2>
        <button 
          className="text-primary text-sm hover:underline"
          onClick={handleUpgrade}
        >
          Upgrade to unlock
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Planning Feature */}
        <div className="bg-card rounded-xl p-5 relative">
          <BlurOverlay feature="Unicorn" />
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Planning to Execute</h3>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <i className="fas fa-tasks text-primary"></i>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-muted-foreground block mb-2">Initial Budget</label>
            <div className="flex items-center">
              <div className="bg-accent rounded-l-lg p-3 border-y border-l border-border">
                <i className="fas fa-dollar-sign text-muted-foreground"></i>
              </div>
              <Input
                type="text"
                className="flex-1 py-3 px-4 rounded-r-lg bg-accent border border-border text-white placeholder-muted-foreground focus:outline-none"
                placeholder="Enter initial budget..."
                value={initialBudget}
                onChange={handleBudgetChange}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-accent rounded-lg p-4">
              <h4 className="font-medium mb-3">Budget Allocation</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Development</span>
                    <span>$50,000</span>
                  </div>
                  <div className="w-full bg-background-light rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: "40%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Marketing</span>
                    <span>$30,000</span>
                  </div>
                  <div className="w-full bg-background-light rounded-full h-1.5">
                    <div className="bg-success h-1.5 rounded-full" style={{ width: "25%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Operations</span>
                    <span>$20,000</span>
                  </div>
                  <div className="w-full bg-background-light rounded-full h-1.5">
                    <div className="bg-warning h-1.5 rounded-full" style={{ width: "15%" }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-accent rounded-lg p-4">
              <h4 className="font-medium mb-3">Execution Roadmap</h4>
              <div className="space-y-3">
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3 shrink-0">
                    <span className="text-primary text-xs">1</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Market Research & Validation</div>
                    <div className="text-xs text-muted-foreground">1-2 months • $5,000</div>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3 shrink-0">
                    <span className="text-primary text-xs">2</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">MVP Development</div>
                    <div className="text-xs text-muted-foreground">3-4 months • $30,000</div>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3 shrink-0">
                    <span className="text-primary text-xs">3</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Initial Launch & Marketing</div>
                    <div className="text-xs text-muted-foreground">1-2 months • $15,000</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Investor Discovery Feature */}
        <div className="bg-card rounded-xl p-5 relative">
          <BlurOverlay feature="Unicorn" />
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Finding Investors</h3>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <i className="fas fa-hand-holding-usd text-primary"></i>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-2 bg-background-light bg-opacity-30 rounded-lg text-xs text-muted-foreground">
              <i className="fas fa-info-circle mr-1"></i> Investor information is AI-generated. Always verify manually before contacting.
            </div>
            
            <div className="divide-y divide-border">
              <div className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">Sarah Johnson</div>
                    <div className="text-xs text-muted-foreground">TechVentures Capital</div>
                  </div>
                  <a href="#" className="text-primary text-xs hover:underline">Crunchbase</a>
                </div>
                <div className="mt-1 flex items-center">
                  <span className="text-xs bg-primary bg-opacity-20 text-primary px-2 py-0.5 rounded mr-2">SaaS</span>
                  <span className="text-xs bg-primary bg-opacity-20 text-primary px-2 py-0.5 rounded">Early Stage</span>
                </div>
              </div>
              
              <div className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">Michael Chen</div>
                    <div className="text-xs text-muted-foreground">Horizon Ventures</div>
                  </div>
                  <a href="#" className="text-primary text-xs hover:underline">Crunchbase</a>
                </div>
                <div className="mt-1 flex items-center">
                  <span className="text-xs bg-primary bg-opacity-20 text-primary px-2 py-0.5 rounded mr-2">Fintech</span>
                  <span className="text-xs bg-primary bg-opacity-20 text-primary px-2 py-0.5 rounded">Series A</span>
                </div>
              </div>
              
              <div className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">Alex Rodriguez</div>
                    <div className="text-xs text-muted-foreground">Future Fund</div>
                  </div>
                  <a href="#" className="text-primary text-xs hover:underline">Crunchbase</a>
                </div>
                <div className="mt-1 flex items-center">
                  <span className="text-xs bg-primary bg-opacity-20 text-primary px-2 py-0.5 rounded mr-2">B2B</span>
                  <span className="text-xs bg-primary bg-opacity-20 text-primary px-2 py-0.5 rounded">Seed</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button className="bg-primary text-white rounded-lg py-2 px-4 text-sm hover:bg-opacity-90 transition-colors" onClick={handleUpgrade}>
                Unlock Investor Matching
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
