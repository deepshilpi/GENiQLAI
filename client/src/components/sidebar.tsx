import { useState, useEffect, useContext } from "react";
import { useLocation } from "wouter";
import { AuthContext } from "@/hooks/use-auth";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
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
  Bookmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import Logo from "@/assets/logo";
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
  const [notificationCount, setNotificationCount] = useState(3); // Example count
  const isMobile = useIsMobile();
  const { openAuthDialog } = useAuthDialog();
  
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
  
  const handleLogout = () => {
    if (logoutMutation) {
      logoutMutation.mutate();
    }
  };
  
  // Add backdrop overlay for mobile
  const handleBackdropClick = () => {
    if (isMobile) {
      toggleSidebar();
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
                isActive("/community") && "active",
                collapsed && "justify-center px-2"
              )}
              onClick={() => navigate("/community")}
            >
              <MessageSquare className="w-5 h-5" />
              {!collapsed && <span>Community</span>}
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
                <Mail className="w-5 h-5" />
                {!collapsed && <span>Messages</span>}
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
      <div className="px-3 py-2 border-t border-vision-purple-200/10">
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
                onClick={() => openAuthDialog({ defaultTab: 'login' })}
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
