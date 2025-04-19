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
  Menu,
  BrainCircuit,
  MessageSquare,
  LogOut
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
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Example count
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

  // Mobile Header (replaces sidebar on mobile) - The main part of this new implementation
  if (isMobile) {
    return (
      <header className="vision-header px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50 vision-card shadow-lg">
        {/* Logo section */}
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-vision-primary-gradient flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">GENIQL</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          {/* Notifications dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg w-8 h-8"
              >
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                      {notificationCount}
                    </span>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/10 text-white w-72">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                <Badge className="bg-vision-primary-gradient text-white text-xs py-0">
                  {notificationCount} new
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-vision-purple-200/10" />
              {/* Sample notifications */}
              <div className="max-h-80 overflow-y-auto py-1">
                <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10 flex flex-col items-start py-3">
                  <div className="flex w-full">
                    <div className="w-8 h-8 rounded-full bg-vision-primary-gradient/20 flex-shrink-0 flex items-center justify-center mr-2">
                      <MessageSquare className="w-4 h-4 text-vision-purple-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">New community comment</p>
                      <p className="text-xs text-white/60 mt-1">John replied to your post about AI startups</p>
                      <p className="text-xs text-white/40 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10 flex flex-col items-start py-3">
                  <div className="flex w-full">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex-shrink-0 flex items-center justify-center mr-2">
                      <BrainCircuit className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Analysis complete</p>
                      <p className="text-xs text-white/60 mt-1">Your startup idea analysis is ready to view</p>
                      <p className="text-xs text-white/40 mt-1">1 day ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10 flex flex-col items-start py-3">
                  <div className="flex w-full">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center mr-2">
                      <User className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">New follower</p>
                      <p className="text-xs text-white/60 mt-1">Sarah is now following you</p>
                      <p className="text-xs text-white/40 mt-1">3 days ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-vision-purple-200/10" />
              <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10 justify-center py-2">
                <span className="text-sm text-white/70">View all notifications</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User account menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-lg p-0">
                <div className="w-8 h-8 rounded-lg bg-vision-primary-gradient flex items-center justify-center">
                  {user?.username ? (
                    <span className="text-sm font-medium text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/10 text-white w-56">
              <div className="px-2 py-2 border-b border-vision-purple-200/10">
                <p className="text-sm font-medium text-white truncate">{user?.username || "Guest"}</p>
                <p className="text-xs text-white/50">{user?.planType || "Free"} Plan</p>
              </div>
              <DropdownMenuSeparator className="bg-vision-purple-200/10" />
              <div className="py-1">
                <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10" onClick={() => navigate("/")}>
                  <BrainCircuit className="w-4 h-4 mr-2" />
                  <span>AI Analysis</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10" onClick={() => navigate("/community")}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span>Community</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-vision-purple-200/10" />
              <div className="py-1">
                <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10" onClick={() => navigate(`/profile/${user?.username}`)}>
                  <User className="w-4 h-4 mr-2" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10" onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-vision-purple-200/10" />
              <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg w-8 h-8"
            onClick={toggleTheme}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </header>
    );
  }
  
  // Desktop Header
  return (
    <header className="vision-header px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10 w-full transition-all duration-300">
      <div className="flex items-center gap-3">
        <span className="text-white font-medium">{getPageTitle()}</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg w-9 h-9"
          onClick={toggleTheme}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        
        {/* Notifications Button with badge */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg w-9 h-9"
            >
              <div className="relative">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {notificationCount}
                  </span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/10 text-white w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notifications</span>
              <Badge className="bg-vision-primary-gradient text-white text-xs py-0">
                {notificationCount} new
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-vision-purple-200/10" />
            {/* Sample notifications */}
            <div className="max-h-96 overflow-y-auto py-1">
              <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10 flex flex-col items-start py-3">
                <div className="flex w-full">
                  <div className="w-8 h-8 rounded-full bg-vision-primary-gradient/20 flex-shrink-0 flex items-center justify-center mr-2">
                    <MessageSquare className="w-4 h-4 text-vision-purple-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">New community comment</p>
                    <p className="text-xs text-white/60 mt-1">John replied to your post about AI startups</p>
                    <p className="text-xs text-white/40 mt-1">2 hours ago</p>
                  </div>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10 flex flex-col items-start py-3">
                <div className="flex w-full">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex-shrink-0 flex items-center justify-center mr-2">
                    <BrainCircuit className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Analysis complete</p>
                    <p className="text-xs text-white/60 mt-1">Your startup idea analysis is ready to view</p>
                    <p className="text-xs text-white/40 mt-1">1 day ago</p>
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10 flex flex-col items-start py-3">
                <div className="flex w-full">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">New follower</p>
                    <p className="text-xs text-white/60 mt-1">Sarah is now following you</p>
                    <p className="text-xs text-white/40 mt-1">3 days ago</p>
                  </div>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="bg-vision-purple-200/10" />
            <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10 justify-center py-2">
              <span className="text-sm text-white/70">View all notifications</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg w-9 h-9"
          onClick={() => navigate("/settings")}
        >
          <Settings className="w-5 h-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 hover:bg-vision-purple-100/10 rounded-lg">
              <div className="flex flex-col items-end mr-2">
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
              <ChevronDown className="w-4 h-4 text-white/50 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/10 text-white w-56">
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
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
