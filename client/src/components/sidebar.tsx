import { useState, useEffect, useContext } from "react";
import { useLocation } from "wouter";
import { AuthContext } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { useNotifications } from "@/hooks/use-notifications"; 
import { Button } from "@/components/ui/button";
import { SavedIdeasDropdown } from "@/components/saved-ideas-dropdown";
import { 
  LayoutDashboard, 
  BrainCircuit, 
  MessageSquare, 
  BarChart3, 
  Newspaper, 
  User, 
  Settings, 
  CreditCard, 
  LogOut,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  Mail,
  BookmarkIcon,
  Bookmark,
  Check,
  Users,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import Logo from "@/assets/logo";
import { format, formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const [location, navigate] = useLocation();
  // Try to get auth context, but provide fallback if not available
  const auth = useContext(AuthContext);
  const user = auth?.user || null;
  const logoutMutation = auth?.logoutMutation;
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Use real notifications from hook instead of dummy data
  const { 
    notifications, 
    unreadCount: notificationCount, 
    isLoading: notificationsLoading,
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  // Always show sidebar for everyone, but adapt content based on auth status
  
  // Set initial collapsed state based on screen size
  useEffect(() => {
    setCollapsed(isMobile);
    
    // Add class to body for mobile sidebar control
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
        setSidebarOpen(false);
        document.body.classList.remove('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    };
    
    // Initial setup
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);
  
  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
      
      if (!sidebarOpen) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    } else {
      setCollapsed(!collapsed);
      
      if (collapsed) {
        document.body.classList.remove('sidebar-collapsed');
      } else {
        document.body.classList.add('sidebar-collapsed');
      }
    }
  };
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  // Fixed logout handler with improved error handling
  const handleLogout = () => {
    // Check if already logging out
    if (logoutMutation?.isPending) {
      console.log("Logout already in progress, ignoring duplicate request");
      return;
    }
    
    // Check if logged in first
    if (!user) {
      console.log("User already logged out, no need to logout again");
      navigate("/auth");
      return;
    }
    
    if (logoutMutation) {
      console.log("Executing logout");
      
      // Set UI state immediately for better feedback
      queryClient.setQueryData(["/api/user"], null);
      
      // Clear session storage
      sessionStorage.removeItem('auth_login_success');
      sessionStorage.removeItem('auth_logout_requested');
      
      // Do the actual logout API call
      logoutMutation.mutate(undefined, {
        onSettled: () => {
          // Force navigation to auth page
          window.location.href = "/auth";
        }
      });
    }
  };
  
  // Add backdrop overlay for mobile
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Stop propagation to prevent event bubbling
    e.stopPropagation();
    
    if (isMobile) {
      setSidebarOpen(false);
      document.body.classList.remove('sidebar-open');
    }
  };
  
  return (
    <div className="sidebar-container">
      {/* Backdrop overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 sidebar-backdrop" 
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}
      
      <aside 
        className={cn(
          "sidebar fixed left-0 top-0 h-full vision-sidebar flex flex-col z-20 transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[260px]",
          isMobile && "w-[260px]",
          isMobile && sidebarOpen ? "translate-x-0" : isMobile ? "-translate-x-full" : "translate-x-0"
        )}
      >
      {/* Logo section */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <Logo width={40} height={40} />
          </div>
          {!collapsed && (
            <div className="ml-3">
              <span className="font-bold text-xl text-white">GENIQL</span>
            </div>
          )}
        </div>
        <button 
          onClick={toggleSidebar} 
          className="w-6 h-6 flex items-center justify-center rounded-full bg-vision-purple-200/10 text-white hover:bg-vision-purple-200/20 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-2">
          <li>
            <div 
              className={cn(
                "vision-sidebar-item cursor-pointer",
                isActive("/") && "active",
                collapsed && "justify-center px-2"
              )}
              onClick={() => navigate("/")}
            >
              <BrainCircuit className="w-5 h-5" />
              {!collapsed && <span>Startup Analysis</span>}
            </div>
          </li>
          <li>
            <div 
              className={cn(
                "vision-sidebar-item cursor-pointer",
                (isActive("/community/threads") || isActive("/community/post")) && "active",
                collapsed && "justify-center px-2"
              )}
              onClick={() => navigate("/community/threads")}
            >
              <Users className="w-5 h-5" />
              {!collapsed && <span>Hustlers Community</span>}
            </div>
          </li>
          {user && (
            <li>
              <div 
                className={cn(
                  "vision-sidebar-item cursor-pointer",
                  isActive("/messages") && "active",
                  collapsed && "justify-center px-2"
                )}
                onClick={() => navigate("/messages")}
              >
                <MessageSquare className="w-5 h-5" />
                {!collapsed && <span>Chats</span>}
              </div>
            </li>
          )}
          
          {user && (
            <li>
              <div 
                className={cn(
                  "vision-sidebar-item cursor-pointer",
                  isActive("/saved-ideas") && "active",
                  collapsed && "justify-center px-2"
                )}
                onClick={() => navigate("/saved-ideas")}
              >
                <Bookmark className="w-5 h-5" />
                {!collapsed && <span>Saved Ideas</span>}
              </div>
            </li>
          )}
          
          {/* Removed duplicate Saved Ideas dropdown in favor of dedicated page */}

          
        </ul>
      </nav>
      
      {/* Account section */}
      <div className="px-3 py-2 border-t border-vision-purple-200/10 mb-16">
        {!collapsed && (
          <h4 className="text-white/40 uppercase text-xs tracking-wide px-4 py-2">Account</h4>
        )}
        
        {user ? (
          // Authenticated user view
          <ul className="space-y-1 mb-4">
            {/* Notifications Button */}
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div 
                    className={cn(
                      "vision-sidebar-item cursor-pointer",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <div className="relative">
                      <Bell className="w-5 h-5" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                          {notificationCount}
                        </span>
                      )}
                    </div>
                    {!collapsed && <span>Notifications</span>}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/10 text-white w-80">
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
            </li>
            

            <li>
              <div 
                className={cn(
                  "vision-sidebar-item cursor-pointer",
                  isActive("/settings") && "active",
                  collapsed && "justify-center px-2"
                )}
                onClick={() => navigate("/settings")}
              >
                <Settings className="w-5 h-5" />
                {!collapsed && <span>Settings</span>}
              </div>
            </li>

            <li>
              <button 
                onClick={handleLogout}
                className={cn(
                  "vision-sidebar-item w-full text-left",
                  collapsed && "justify-center px-2"
                )}
              >
                <LogOut className="w-5 h-5" />
                {!collapsed && <span>Logout</span>}
              </button>
            </li>
          </ul>
        ) : (
          // Guest user view - Single button for login/register
          <ul className="space-y-1 mb-4">
            <li>
              <button
                onClick={() => navigate('/auth')}
                className={cn(
                  "vision-sidebar-item w-full text-left bg-primary/20 hover:bg-primary/30",
                  collapsed && "justify-center px-2"
                )}
              >
                <User className="w-5 h-5" />
                {!collapsed && <span>Sign In / Register</span>}
              </button>
            </li>
          </ul>
        )}
      </div>
      
      
    </aside>
    </div>
  );
}
