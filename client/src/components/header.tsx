import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
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
  const { openAuthDialog } = useAuthDialog();
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
      <header className="geniql-header px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-md">
        {/* Logo section with menu toggle */}
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-md mr-1"
              onClick={toggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium text-lg">GENIQL</span>
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
                className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-md w-8 h-8"
              >
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[10px] text-white font-medium">
                      {notificationCount}
                    </span>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                <Badge variant="destructive" className="text-xs">
                  {notificationCount} new
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Sample notifications */}
              <div className="max-h-80 overflow-y-auto py-1">
                <DropdownMenuItem className="cursor-pointer flex flex-col items-start py-3">
                  <div className="flex w-full">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mr-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New community comment</p>
                      <p className="text-xs text-muted-foreground mt-1">John replied to your post about AI startups</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="cursor-pointer flex flex-col items-start py-3">
                  <div className="flex w-full">
                    <div className="w-8 h-8 rounded-full bg-success/20 flex-shrink-0 flex items-center justify-center mr-2">
                      <BrainCircuit className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Analysis complete</p>
                      <p className="text-xs text-muted-foreground mt-1">Your startup idea analysis is ready to view</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">1 day ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer flex flex-col items-start py-3">
                  <div className="flex w-full">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex-shrink-0 flex items-center justify-center mr-2">
                      <User className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New follower</p>
                      <p className="text-xs text-muted-foreground mt-1">Sarah is now following you</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">3 days ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center py-2">
                <span className="text-sm text-muted-foreground">View all notifications</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User account menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-md p-0">
                  <div className="w-8 h-8 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user?.username?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium truncate">{user?.username || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.planType || "Free"} Plan</p>
                </div>
                <DropdownMenuSeparator />
                <div className="py-1">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/")}>
                    <BrainCircuit className="w-4 h-4 mr-2" />
                    <span>AI Analysis</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/community")}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    <span>Community</span>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <div className="py-1">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/profile/${user?.username || 'user'}`)}>
                    <User className="w-4 h-4 mr-2" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default"
              size="sm"
              className="font-medium"
              onClick={() => openAuthDialog({ defaultTab: "login" })}
            >
              <User className="w-4 h-4 mr-2" />
              <span>Sign In</span>
            </Button>
          )}

          {/* Theme toggle removed as requested */}
        </div>
      </header>
    );
  }
  
  // Desktop Header
  return (
    <header className="geniql-header px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10 w-full transition-all duration-300 md:hidden">
      <div className="flex items-center gap-3">
        <span className="font-medium">{getPageTitle()}</span>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Menu toggle for sidebar */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-md w-9 h-9 mr-2"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        {/* Notifications Button with badge */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-md w-9 h-9"
            >
              <div className="relative">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[10px] text-white font-medium">
                    {notificationCount}
                  </span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notifications</span>
              <Badge variant="destructive" className="text-xs">
                {notificationCount} new
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Sample notifications */}
            <div className="max-h-96 overflow-y-auto py-1">
              <DropdownMenuItem className="cursor-pointer flex flex-col items-start py-3">
                <div className="flex w-full">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mr-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New community comment</p>
                    <p className="text-xs text-muted-foreground mt-1">John replied to your post about AI startups</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">2 hours ago</p>
                  </div>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer flex flex-col items-start py-3">
                <div className="flex w-full">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex-shrink-0 flex items-center justify-center mr-2">
                    <BrainCircuit className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Analysis complete</p>
                    <p className="text-xs text-muted-foreground mt-1">Your startup idea analysis is ready to view</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">1 day ago</p>
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer flex flex-col items-start py-3">
                <div className="flex w-full">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex-shrink-0 flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New follower</p>
                    <p className="text-xs text-muted-foreground mt-1">Sarah is now following you</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">3 days ago</p>
                  </div>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center py-2">
              <span className="text-sm text-muted-foreground">View all notifications</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-md w-9 h-9"
          onClick={() => navigate("/settings")}
        >
          <Settings className="w-5 h-5" />
        </Button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-primary/10 rounded-md">
                <div className="flex flex-col items-end mr-2">
                  <span className="text-sm font-medium">{user?.username || 'User'}</span>
                  <span className="text-muted-foreground text-xs">{user?.planType || "Free"}</span>
                </div>
                <div className="w-9 h-9 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user?.username?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/profile/${user?.username || 'user'}`)}>
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="default"
            size="sm"
            className="font-medium"
            onClick={() => openAuthDialog({ defaultTab: "login" })}
          >
            <User className="w-4 h-4 mr-2" />
            <span>Sign In</span>
          </Button>
        )}
      </div>
    </header>
  );
}
