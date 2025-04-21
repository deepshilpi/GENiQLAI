import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Menu,
  BrainCircuit,
  MessageSquare
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Handle sidebar toggle on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (!sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  };
  
  const getPageTitle = () => {
    if (location === "/") return "AI Analysis";
    if (location === "/community") return "Community";
    return "";
  };

  // Mobile Header
  if (isMobile) {
    return (
      <header className="vision-header px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50 vision-card shadow-lg">
        {/* Logo section with menu toggle */}
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg mr-1"
              onClick={toggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="w-9 h-9 rounded-lg bg-vision-primary-gradient flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">GENIQL</span>
          </div>
        </div>
      </header>
    );
  }
  
  // Desktop Header
  return (
    <header className="vision-header px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10 w-full transition-all duration-300 md:hidden">
      <div className="flex items-center gap-3">
        <span className="text-white font-medium">{getPageTitle()}</span>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Menu toggle for sidebar */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg w-9 h-9 mr-2"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}