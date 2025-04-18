import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function PricingPlans() {
  const { user, updatePlanMutation } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  
  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Basic access to get you started",
      features: [
        "Access to the first 4 analysis blocks",
        "Browse and comment in community",
        "View public startup analyses",
        "Basic insights on your ideas"
      ],
      disabled: ["Create posts in community", "Full 8-block analysis", "Budget & execution planning", "Investor discovery", "News about potential startups"]
    },
    {
      name: "Pro",
      price: 10,
      description: "Complete analysis for serious entrepreneurs",
      features: [
        "Access to all 8 analysis blocks",
        "Create posts in the community",
        "Vote on startup ideas",
        "Follow users and track their ideas",
        "News about potential startups"
      ],
      disabled: ["Budget & execution planning", "Investor discovery"]
    },
    {
      name: "Unicorn",
      price: 15,
      description: "Everything you need to launch your startup",
      features: [
        "All features in Pro plan",
        "Budget breakdown & execution plan",
        "Investor discovery with matches",
        "Priority analysis processing",
        "Export reports as PDF"
      ]
    }
  ];
  
  const handleUpgrade = (planType: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Convert plan name to lowercase for backend
    const planTypeLower = planType.toLowerCase();
    
    // If user already has this plan, show message
    if (user.planType === planTypeLower) {
      toast({
        title: "Already subscribed",
        description: `You are already on the ${planType} plan.`
      });
      return;
    }
    
    // In a real app, this would show a payment form
    // For demo purposes, directly update the plan
    updatePlanMutation.mutate({ planType: planTypeLower });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card key={plan.name} className={`bg-card border-border ${plan.name === "Pro" ? "border-primary" : ""}`}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{plan.name}</span>
              {plan.name === "Pro" && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Popular</span>}
            </CardTitle>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
              <span className="text-muted-foreground ml-2">/month</span>
            </div>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex">
                  <Check className="text-success mr-2 h-5 w-5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
              {plan.disabled && plan.disabled.map((feature, i) => (
                <li key={i} className="flex text-muted-foreground">
                  <span className="mr-2 h-5 w-5 flex-shrink-0">✕</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant={plan.name === user?.planType?.charAt(0).toUpperCase() + user?.planType?.slice(1) ? "outline" : "default"}
              onClick={() => handleUpgrade(plan.name)}
              disabled={updatePlanMutation.isPending}
            >
              {plan.name === user?.planType?.charAt(0).toUpperCase() + user?.planType?.slice(1) 
                ? "Current Plan" 
                : updatePlanMutation.isPending 
                  ? "Updating..." 
                  : `Upgrade to ${plan.name}`}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
