import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Bell, 
  Settings, 
  User,
  Sun,
  Moon,
  ChevronDown,
  Menu
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
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
  
  useEffect(() => {
    // Reset sidebar state when resizing from mobile to desktop
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
        document.body.classList.remove('sidebar-open');
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const getPageTitle = () => {
    if (location === "/") return "AI Analysis";
    if (location === "/dashboard") return "Dashboard";
    if (location === "/community") return "Community";
    if (location === "/analytics") return "Analytics";
    if (location === "/market-news") return "Market News";
    if (location.startsWith("/profile")) return "Profile";
    if (location === "/settings") return "Settings";
    if (location === "/subscription") return "Plans";
    return "";
  };
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="vision-header px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10 main-content transition-all duration-300">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg"
            onClick={toggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <span className="text-white font-medium">{getPageTitle()}</span>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg w-8 h-8 sm:w-9 sm:h-9 sm:flex"
          onClick={toggleTheme}
        >
          {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg w-8 h-8 sm:w-9 sm:h-9 hidden sm:flex header-actions"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg w-8 h-8 sm:w-9 sm:h-9 hidden sm:flex header-actions"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 hover:bg-vision-purple-100/10 rounded-lg">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-white text-sm font-medium">{user?.username || "Guest"}</span>
                <span className="text-white/50 text-xs">{user?.planType || "Free"}</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-vision-primary-gradient flex items-center justify-center">
                {user?.username ? (
                  <span className="text-sm font-medium text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-white/50 ml-1 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/10 text-white">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-vision-purple-200/10" />
            <Link href={`/profile/${user?.username}`}>
              <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10">
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10">
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="bg-vision-purple-200/10" />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-vision-purple-100/10">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
