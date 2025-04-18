import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { PricingPlans } from "@/components/pricing-plans";
import { Footer } from "@/components/footer";

export default function HomePage() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <header className="bg-background py-6 px-4 border-b border-border">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2">
              <i className="fas fa-brain text-white"></i>
            </div>
            <span className="font-bold text-xl text-white">GENIQL</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded ml-2">BETA</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Button onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {/* Hero Banner */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Turn Startup Ideas into 
              <span className="text-primary"> Data-Driven Success</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              GENIQL analyzes your startup idea across 8 key metrics using AI, giving you actionable insights and a community to connect with fellow entrepreneurs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" onClick={() => navigate(user ? "/dashboard" : "/auth")}>
                Try It Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("#features")}>
                Learn More
              </Button>
            </div>
          </div>
        </section>
      
        {/* Features */}
        <section id="features" className="py-16 px-4 bg-accent">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">8-Point AI Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Success Rate",
                  icon: "chart-pie",
                  description: "Get a data-driven prediction of your startup's success probability based on market conditions."
                },
                {
                  title: "Competitors",
                  icon: "users",
                  description: "Identify key competitors and understand your potential market share in the industry."
                },
                {
                  title: "Market Viability",
                  icon: "check-circle",
                  description: "Evaluate if there's a sustainable market for your idea with growth potential."
                },
                {
                  title: "Value Proposition",
                  icon: "star",
                  description: "Discover what makes your idea unique and how to position it in the market."
                },
                {
                  title: "CAGR Analysis",
                  icon: "chart-line",
                  description: "Project your compound annual growth rate compared to industry averages."
                },
                {
                  title: "Failed Executions",
                  icon: "exclamation-triangle",
                  description: "Learn from similar startups that didn't succeed and avoid common pitfalls."
                },
                {
                  title: "Funding Requirements",
                  icon: "dollar-sign",
                  description: "Get estimates on how much capital you'll need at each stage of growth."
                },
                {
                  title: "Go-to-Market Strategy",
                  icon: "rocket",
                  description: "Develop a comprehensive plan to launch and scale your startup effectively."
                }
              ].map((feature, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      <i className={`fas fa-${feature.icon} text-primary`}></i>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Community */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-4">Join Our Entrepreneur Community</h2>
                <p className="text-muted-foreground mb-6">
                  Connect with like-minded entrepreneurs, share your startup ideas, get feedback, and learn from others' experiences.
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    "Post your startup ideas after analysis",
                    "Receive votes and feedback from the community",
                    "Follow other entrepreneurs and track their journey",
                    "Discover trending startup concepts and markets"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <i className="fas fa-check-circle text-success mt-1 mr-2"></i>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => navigate(user ? "/community" : "/auth")}>
                  Explore Community
                </Button>
              </div>
              <div className="md:w-1/2 bg-card rounded-xl p-6">
                <div className="space-y-4">
                  {[1, 2].map((post) => (
                    <div key={post} className="p-4 bg-accent rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20"></div>
                        <div>
                          <div className="font-medium">Entrepreneur #{post}</div>
                          <div className="text-xs text-muted-foreground">Posted recently</div>
                        </div>
                      </div>
                      <h3 className="font-bold mb-2">Example Startup Idea #{post}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        This is a preview of what community posts look like. Upgrade to Pro to create your own!
                      </p>
                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <span className="text-xs bg-accent-foreground/10 px-2 py-1 rounded">Tag</span>
                          <span className="text-xs bg-accent-foreground/10 px-2 py-1 rounded">Tag</span>
                        </div>
                        <div className="flex gap-2 text-sm">
                          <span><i className="fas fa-arrow-up text-success"></i> 42</span>
                          <span><i className="fas fa-comment text-muted"></i> 15</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing */}
        <section id="pricing" className="py-16 px-4 bg-accent">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Choose Your Plan</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Select the plan that fits your needs. Upgrade anytime as your startup grows.
            </p>
            <PricingPlans />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
