import React from "react";
import { useLocation } from "wouter";
import { 
  Home, 
  BrainCircuit, 
  MessageSquare, 
  LineChart, 
  Newspaper, 
  Settings, 
  CreditCard,
  User,
  X
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetClose 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };
  
  // Utility function to determine if a nav item is active
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="left" 
        className="p-0 w-[270px] bg-vision-dark/95 backdrop-blur-md border-r border-vision-purple-200/10 text-white"
      >
        <SheetHeader className="p-4 border-b border-vision-purple-200/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/src/assets/logo.svg" alt="GENIQL Logo" className="w-full h-full" />
              </div>
              <SheetTitle className="font-heading font-bold text-lg text-white">GENIQL</SheetTitle>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-white/70 hover:text-white hover:bg-vision-purple-100/10">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          {user && (
            <div className="flex items-center mt-4 p-3 rounded-xl bg-vision-card/30 border border-vision-purple-200/10">
              <div className="w-10 h-10 rounded-lg bg-vision-primary-gradient flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-white">
                  {user?.username?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
                <p className="text-xs text-white/50">{user?.planType || "Free"} Plan</p>
              </div>
            </div>
          )}
        </SheetHeader>
        
        <div className="py-4">
          <div className="px-3 pb-2">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider px-3 mb-1">Main</p>
            <nav className="space-y-1">
              <Button 
                variant="ghost" 
                className={`w-full justify-start px-3 py-2 text-sm ${isActive('/') 
                  ? 'bg-vision-primary-gradient text-white' 
                  : 'text-white/70 hover:text-white hover:bg-vision-purple-100/10'} rounded-lg`}
                onClick={() => handleNavigation('/')}
              >
                <BrainCircuit className="mr-2 h-4 w-4" />
                AI Analysis
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start px-3 py-2 text-sm ${isActive('/dashboard') 
                  ? 'bg-vision-primary-gradient text-white' 
                  : 'text-white/70 hover:text-white hover:bg-vision-purple-100/10'} rounded-lg`}
                onClick={() => handleNavigation('/dashboard')}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start px-3 py-2 text-sm ${isActive('/community') 
                  ? 'bg-vision-primary-gradient text-white' 
                  : 'text-white/70 hover:text-white hover:bg-vision-purple-100/10'} rounded-lg`}
                onClick={() => handleNavigation('/community')}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Community
              </Button>
              </nav>
          </div>
          
          <div className="px-3 pt-4 pb-2">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider px-3 mb-1">Account</p>
            <nav className="space-y-1">
              {user && (
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start px-3 py-2 text-sm ${isActive('/profile') 
                    ? 'bg-vision-primary-gradient text-white' 
                    : 'text-white/70 hover:text-white hover:bg-vision-purple-100/10'} rounded-lg`}
                  onClick={() => handleNavigation(`/profile/${user?.username || 'user'}`)}
                >
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </Button>
              )}
              <Button 
                variant="ghost" 
                className={`w-full justify-start px-3 py-2 text-sm ${isActive('/settings') 
                  ? 'bg-vision-primary-gradient text-white' 
                  : 'text-white/70 hover:text-white hover:bg-vision-purple-100/10'} rounded-lg`}
                onClick={() => handleNavigation('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}