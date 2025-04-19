import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
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
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function Sidebar() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Set initial collapsed state based on screen size
  useEffect(() => {
    setCollapsed(isMobile);
    
    // Add class to body for mobile sidebar control
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
        document.body.classList.remove('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    };
    
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
    }
  };
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Mobile toggle button
  if (isMobile && !sidebarOpen) {
    return (
      <>
        <div 
          className="fixed left-0 top-1/2 -translate-y-1/2 bg-vision-purple-700 rounded-r-md p-2 shadow-lg z-50 cursor-pointer"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5 text-white" />
        </div>
        <aside className="sidebar fixed left-0 top-0 h-full vision-sidebar flex flex-col z-20 w-[260px] -translate-x-full transition-transform duration-300"></aside>
      </>
    );
  }
  
  // Add backdrop overlay for mobile
  const handleBackdropClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };
  
  return (
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
          <div className="w-10 h-10 rounded-lg bg-vision-primary-gradient flex items-center justify-center flex-shrink-0">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="ml-3">
              <span className="font-bold text-xl text-white">GENIQL</span>
              <span className="text-[10px] bg-vision-purple-200/20 px-1.5 py-0.5 rounded-sm ml-1 text-white/80">BETA</span>
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
      <nav className="flex-1 px-3 py-6">
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
              {!collapsed && <span>AI Analysis</span>}
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
          <li>
            <div 
              className={cn(
                "vision-sidebar-item cursor-pointer",
                isActive("/analytics") && "active",
                collapsed && "justify-center px-2"
              )}
              onClick={() => navigate("/analytics")}
            >
              <BarChart3 className="w-5 h-5" />
              {!collapsed && <span>Analytics</span>}
            </div>
          </li>
          {(user?.planType === "pro" || user?.planType === "unicorn") && (
            <li>
              <div 
                className={cn(
                  "vision-sidebar-item cursor-pointer",
                  isActive("/market-news") && "active",
                  collapsed && "justify-center px-2"
                )}
                onClick={() => navigate("/market-news")}
              >
                <Newspaper className="w-5 h-5" />
                {!collapsed && <span>Market News</span>}
              </div>
            </li>
          )}
        </ul>
      </nav>
      
      {/* Account section */}
      <div className="px-3 py-2 border-t border-vision-purple-200/10">
        {!collapsed && (
          <h4 className="text-white/40 uppercase text-xs tracking-wide px-4 py-2">Account</h4>
        )}
        <ul className="space-y-1 mb-4">
          <li>
            <div 
              className={cn(
                "vision-sidebar-item cursor-pointer",
                isActive(`/profile/${user?.username}`) && "active",
                collapsed && "justify-center px-2"
              )}
              onClick={() => navigate(`/profile/${user?.username}`)}
            >
              <User className="w-5 h-5" />
              {!collapsed && <span>Profile</span>}
            </div>
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
            <div 
              className={cn(
                "vision-sidebar-item cursor-pointer",
                isActive("/subscription") && "active",
                collapsed && "justify-center px-2"
              )}
              onClick={() => navigate("/subscription")}
            >
              <CreditCard className="w-5 h-5" />
              {!collapsed && <span>Plans</span>}
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
      </div>
      
      {/* Help section - only show when not collapsed */}
      {!collapsed && (
        <div className="p-4 mx-3 mb-4 vision-card bg-vision-card/50">
          <div className="mb-2 text-sm text-white font-medium flex items-center">
            <HelpCircle className="w-4 h-4 mr-2 text-vision-purple-700" />
            Need help?
          </div>
          <p className="text-xs text-white/60 mb-3">Check our documentation</p>
          <Button 
            variant="outline" 
            className="w-full bg-vision-purple-100/10 text-white text-xs h-8 border-vision-purple-300/20 hover:bg-vision-purple-200/20"
          >
            Documentation
          </Button>
        </div>
      )}
    </aside>
  );
}
