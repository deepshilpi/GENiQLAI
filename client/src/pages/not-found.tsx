import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [_, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-vision-bg p-4">
      <div className="vision-card w-full max-w-md p-8 relative overflow-hidden">
        {/* Glowing effect at the top */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full" 
          style={{
            background: "radial-gradient(circle, rgba(161, 99, 247, 0.3) 0%, rgba(161, 99, 247, 0) 70%)",
            filter: "blur(20px)"
          }}
        />
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-vision-card/80 flex items-center justify-center mb-4 border border-red-500/30">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">404 Not Found</h1>
          <p className="text-white/60">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
          
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <Button 
            onClick={() => navigate("/")} 
            className="bg-vision-primary-gradient hover:brightness-110 transition-all text-white font-medium w-full sm:w-auto flex gap-2 items-center"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Button>
          <Button 
            onClick={() => window.history.back()} 
            variant="outline"
            className="border-vision-purple-200/20 text-white hover:bg-vision-purple-100/10 w-full sm:w-auto flex gap-2 items-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
        
        {/* Bottom glowing effect */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20" 
          style={{
            background: "radial-gradient(ellipse at center, rgba(255, 99, 99, 0.15) 0%, rgba(161, 99, 247, 0) 70%)",
            filter: "blur(20px)"
          }}
        />
      </div>
    </div>
  );
}
