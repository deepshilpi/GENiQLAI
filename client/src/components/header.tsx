import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "wouter";
import { AuthContext } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
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
  LogOut,
  BookmarkIcon,
  Check
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
import { format, formatDistanceToNow } from "date-fns";
import { AuthDebugger } from "@/components/auth-debugger";

export function Header() {
  const [location, navigate] = useLocation();
  // Try to get auth context, but provide fallback if not available
  const auth = useContext(AuthContext);
  const user = auth?.user || null;
  const logoutMutation = auth?.logoutMutation;
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Use notifications hook
  const { 
    notifications, 
    unreadCount: notificationCount, 
    isLoading: notificationsLoading,
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

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
    if (logoutMutation) {
      logoutMutation.mutate();
    } else {
      console.error("Logout mutation not available");
    }
  };

  // Mobile Header
  if (isMobile) {
    return (
      <div>
        {/* Mobile Menu */}
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        
        {/* Auth Debugger for development */}
        <div className="p-2 mb-16">
          <AuthDebugger />
        </div>

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
              <div className="w-9 h-9 flex items-center justify-center" onClick={() => navigate("/")}>
                <Logo width={36} height={36} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Messages button on mobile, Saved Ideas on desktop */}
            {user && (
              isMobile ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg w-8 h-8"
                  onClick={() => navigate("/messages")}
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
              ) : (
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
              )
            )}

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
                  <div className="flex gap-2 items-center">
                    <Badge className="bg-vision-primary-gradient text-white text-xs py-0">
                      {notificationCount} new
                    </Badge>
                    {notificationCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs text-white/70 hover:text-white hover:bg-vision-purple-100/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAllAsRead();
                        }}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Mark all read
                      </Button>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-vision-purple-200/10" />

                {notificationsLoading ? (
                  <div className="py-8 flex justify-center items-center">
                    <div className="w-6 h-6 border-2 border-vision-purple-300 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-white/50 text-sm">
                    No notifications to display
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto py-1">
                    {notifications.map((notification) => {
                      // Get icon based on notification type
                      let Icon = MessageSquare;
                      let iconBgClass = "bg-vision-primary-gradient/20"; 
                      let iconClass = "text-vision-purple-700";

                      if (notification.type === 'analysis') {
                        Icon = BrainCircuit;
                        iconBgClass = "bg-green-500/20";
                        iconClass = "text-green-500";
                      } else if (notification.type === 'follow') {
                        Icon = User;
                        iconBgClass = "bg-blue-500/20";
                        iconClass = "text-blue-500";
                      }

                      // Format time
                      const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

                      return (
                        <DropdownMenuItem 
                          key={notification.id} 
                          className={`cursor-pointer hover:bg-vision-purple-100/10 flex flex-col items-start py-3 ${
                            notification.isRead ? 'opacity-70' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex w-full">
                            <div className={`w-8 h-8 rounded-full ${iconBgClass} flex-shrink-0 flex items-center justify-center mr-2`}>
                              <Icon className={`w-4 h-4 ${iconClass}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{notification.title}</p>
                              <p className="text-xs text-white/60 mt-1">{notification.message}</p>
                              <p className="text-xs text-white/40 mt-1">{timeAgo}</p>
                            </div>
                            {!notification.isRead && (
                              <div className="ml-2 w-2 h-2 bg-vision-purple-500 rounded-full mt-2"></div>
                            )}
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                )}

                <DropdownMenuSeparator className="bg-vision-purple-200/10" />
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-vision-purple-100/10 justify-center py-2"
                  onClick={() => navigate("/notifications")}
                >
                  <span className="text-sm text-white/70">View all notifications</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                onClick={() => navigate('/auth')}
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
    <div>
      {/* Auth Debugger for development */}
      <div className="p-2 mb-4">
        <AuthDebugger />
      </div>
      
      <header className="vision-header px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10 w-full transition-all duration-300 md:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center cursor-pointer" onClick={() => navigate("/")}>
            <Logo width={36} height={36} />
          </div>
          <span className="text-white font-medium">{getPageTitle()}</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Saved Ideas Dropdown - Only show for authenticated users */}
          {user && (
            <SavedIdeasDropdown />
          )}

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
                <div className="flex gap-2 items-center">
                  <Badge className="bg-vision-primary-gradient text-white text-xs py-0">
                    {notificationCount} new
                  </Badge>
                  {notificationCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs text-white/70 hover:text-white hover:bg-vision-purple-100/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-vision-purple-200/10" />

              {notificationsLoading ? (
                <div className="py-8 flex justify-center items-center">
                  <div className="w-6 h-6 border-2 border-vision-purple-300 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-white/50 text-sm">
                  No notifications to display
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto py-1">
                  {notifications.map((notification) => {
                    // Get icon based on notification type
                    let Icon = MessageSquare;
                    let iconBgClass = "bg-vision-primary-gradient/20"; 
                    let iconClass = "text-vision-purple-700";

                    if (notification.type === 'analysis') {
                      Icon = BrainCircuit;
                      iconBgClass = "bg-green-500/20";
                      iconClass = "text-green-500";
                    } else if (notification.type === 'follow') {
                      Icon = User;
                      iconBgClass = "bg-blue-500/20";
                      iconClass = "text-blue-500";
                    }

                    // Format time
                    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

                    return (
                      <DropdownMenuItem 
                        key={notification.id} 
                        className={`cursor-pointer hover:bg-vision-purple-100/10 flex flex-col items-start py-3 ${
                          notification.isRead ? 'opacity-70' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex w-full">
                          <div className={`w-8 h-8 rounded-full ${iconBgClass} flex-shrink-0 flex items-center justify-center mr-2`}>
                            <Icon className={`w-4 h-4 ${iconClass}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            <p className="text-xs text-white/60 mt-1">{notification.message}</p>
                            <p className="text-xs text-white/40 mt-1">{timeAgo}</p>
                          </div>
                          {!notification.isRead && (
                            <div className="ml-2 w-2 h-2 bg-vision-purple-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              )}

              <DropdownMenuSeparator className="bg-vision-purple-200/10" />
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-vision-purple-100/10 justify-center py-2"
                onClick={() => navigate("/notifications")}
              >
                <span className="text-sm text-white/70">View all notifications</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg w-9 h-9"
            onClick={() => navigate("/messages")}
          >
            <MessageSquare className="w-5 h-5" />
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
              onClick={() => navigate("/auth")}
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