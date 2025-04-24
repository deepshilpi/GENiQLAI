import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OptimizedCardProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'minimal';
  isLoading?: boolean;
}

/**
 * Performance-optimized card component that reduces CSS complexity
 * Different variants use progressively less intensive rendering approaches
 */
export function OptimizedCard({ 
  className, 
  children, 
  variant = 'default',
  isLoading = false
}: OptimizedCardProps) {
  // Use simplified CSS with fewer gradients and blurs for better performance
  const baseClasses = "border-0 shadow-sm overflow-hidden";
  
  const variantClasses = {
    default: "bg-card/80",
    gradient: "bg-gradient-to-br from-vision-purple-200/20 to-vision-purple-200/5 backdrop-blur-[2px]",
    minimal: "bg-card/60" 
  };
  
  const loadingClasses = isLoading ? "animate-pulse" : "";
  
  return (
    <Card className={cn(
      baseClasses,
      variantClasses[variant], 
      loadingClasses,
      className
    )}>
      {children}
    </Card>
  );
}