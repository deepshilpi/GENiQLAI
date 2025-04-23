import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}

export function FeatureCard({
  title,
  description,
  icon,
  onClick,
}: FeatureCardProps) {
  const { toast } = useToast();
  
  // Handle button click
  const handleClick = () => {
    onClick();
    toast({
      title: "Feature Activated",
      description: "This feature is now available for use.",
    });
  };

  return (
    <Card className="h-full flex flex-col items-center justify-center p-6 text-center border border-vision-purple-200/30 bg-vision-card/50 backdrop-blur-sm">
      <CardContent className="pt-6 flex flex-col items-center">
        <div className="relative mb-4">
          <div>{icon}</div>
        </div>
        
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-sm text-white/70 mb-4">
          {description}
        </p>
        
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 bg-vision-primary-gradient/10 border-primary/30 hover:bg-vision-primary-gradient/20 text-white"
          onClick={handleClick}
        >
          Activate Feature
        </Button>
      </CardContent>
    </Card>
  );
}