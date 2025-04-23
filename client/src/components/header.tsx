import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
  LogOut,
  BookmarkIcon,
  Download
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
import { MobileMenu } from "@/components/mobile-menu";
import Logo from "@/assets/logo";
import { SavedIdeasDropdown } from "@/components/saved-ideas-dropdown";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationsDropdown } from "@/components/notifications-dropdown";

export function Header() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { unreadCount: notificationCount } = useNotifications(); // Real notification count from hook
  const isMobile = useIsMobile();
  
  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  useEffect(() => {
    // Reset mobile menu state when resizing from mobile to desktop
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
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

  // Mobile Header
  if (isMobile) {
    return (
      <div>
        {/* Mobile Menu */}
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        
        <header className="vision-header px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-40 vision-card shadow-lg">
          {/* Logo section with menu toggle */}
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg mr-1"
                onClick={toggleMobileMenu}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="w-9 h-9 flex items-center justify-center">
                <Logo width={36} height={36} />
              </div>
              <span className="font-heading font-bold text-lg text-white">GENIQL</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Saved Ideas - Only visible when logged in */}
            {user && (
              <SavedIdeasDropdown 
                trigger={
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg w-8 h-8"
                  >
                    <BookmarkIcon className="w-5 h-5" />
                  </Button>
                }
              />
            )}
            
            {/* Notifications dropdown - Real implementation with export feature */}
            <NotificationsDropdown iconSize="sm" />

            {/* User account menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-lg p-0">
                    <div className="w-8 h-8 rounded-lg bg-vision-primary-gradient flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.username?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/10 text-white w-56">
                  <div className="px-2 py-2 border-b border-vision-purple-200/10">
                    <p className="text-sm font-medium text-white truncate">{user?.username || 'User'}</p>
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
                    <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10" onClick={() => navigate(`/profile/${user?.username || 'user'}`)}>
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
            ) : (
              <Button 
                variant="secondary"
                className="bg-vision-primary-gradient text-white hover:brightness-110 transition-all rounded-lg"
                onClick={() => openAuthDialog({ defaultTab: "login" })}
              >
                <User className="w-4 h-4 mr-2" />
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </header>
      </div>
    );
  }
  
  // Desktop Header
  return (
    <header className="vision-header px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10 w-full transition-all duration-300 md:hidden">
      <div className="flex items-center gap-3">
        <span className="text-white font-medium">{getPageTitle()}</span>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Saved Ideas Dropdown - Only show for authenticated users */}
        {user && (
          <SavedIdeasDropdown />
        )}
        
        {/* Notifications with export feature */}
        <NotificationsDropdown />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg w-9 h-9"
          onClick={() => navigate("/settings")}
        >
          <Settings className="w-5 h-5" />
        </Button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-vision-purple-100/10 rounded-lg">
                <div className="flex flex-col items-end mr-2">
                  <span className="text-white text-sm font-medium">{user?.username || 'User'}</span>
                  <span className="text-white/50 text-xs">{user?.planType || "Free"}</span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-vision-primary-gradient flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.username?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-white/50 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/10 text-white w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-vision-purple-200/10" />
              <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10" onClick={() => navigate(`/profile/${user?.username || 'user'}`)}>
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-vision-purple-100/10" onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-vision-purple-200/10" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-vision-purple-100/10">
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="secondary"
            className="bg-vision-primary-gradient text-white hover:brightness-110 transition-all rounded-lg"
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