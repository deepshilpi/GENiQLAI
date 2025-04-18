import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  PieChart, 
  Users, 
  Lightbulb, 
  MessageSquare, 
  TrendingUp, 
  Newspaper, 
  User, 
  Settings, 
  CreditCard, 
  LogOut,
  HelpCircle
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card flex flex-col border-r border-border z-10">
      <div className="p-5 border-b border-border">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2">
            <i className="fas fa-brain text-white"></i>
          </div>
          <span className="font-bold text-xl text-white">GENIQL</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded ml-2">BETA</span>
        </div>
      </div>
      
      <nav className="flex-1 py-4">
        <ul>
          <li className="mb-1">
            <Link href="/dashboard">
              <a className={`flex items-center px-5 py-3 ${isActive("/dashboard") ? "text-white bg-primary rounded-r-full" : "text-muted-foreground hover:text-white transition-colors"}`}>
                <PieChart className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/startup-ideas">
              <a className={`flex items-center px-5 py-3 ${isActive("/startup-ideas") ? "text-white bg-primary rounded-r-full" : "text-muted-foreground hover:text-white transition-colors"}`}>
                <Lightbulb className="w-5 h-5 mr-3" />
                <span>Startup Ideas</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/community">
              <a className={`flex items-center px-5 py-3 ${isActive("/community") ? "text-white bg-primary rounded-r-full" : "text-muted-foreground hover:text-white transition-colors"}`}>
                <MessageSquare className="w-5 h-5 mr-3" />
                <span>Community</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/analytics">
              <a className={`flex items-center px-5 py-3 ${isActive("/analytics") ? "text-white bg-primary rounded-r-full" : "text-muted-foreground hover:text-white transition-colors"}`}>
                <TrendingUp className="w-5 h-5 mr-3" />
                <span>Analytics</span>
              </a>
            </Link>
          </li>
          {(user?.planType === "pro" || user?.planType === "unicorn") && (
            <li className="mb-1">
              <Link href="/market-news">
                <a className={`flex items-center px-5 py-3 ${isActive("/market-news") ? "text-white bg-primary rounded-r-full" : "text-muted-foreground hover:text-white transition-colors"}`}>
                  <Newspaper className="w-5 h-5 mr-3" />
                  <span>Market News</span>
                </a>
              </Link>
            </li>
          )}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        <h4 className="text-muted-foreground uppercase text-xs tracking-wide mb-3">Account</h4>
        <ul>
          <li className="mb-1">
            <Link href={`/profile/${user?.username}`}>
              <a className={`flex items-center px-3 py-2 ${isActive(`/profile/${user?.username}`) ? "text-white" : "text-muted-foreground hover:text-white transition-colors"}`}>
                <User className="w-5 h-5 mr-3" />
                <span>Profile</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/settings">
              <a className={`flex items-center px-3 py-2 ${isActive("/settings") ? "text-white" : "text-muted-foreground hover:text-white transition-colors"}`}>
                <Settings className="w-5 h-5 mr-3" />
                <span>Settings</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/subscription">
              <a className={`flex items-center px-3 py-2 ${isActive("/subscription") ? "text-white" : "text-muted-foreground hover:text-white transition-colors"}`}>
                <CreditCard className="w-5 h-5 mr-3" />
                <span>Subscription</span>
              </a>
            </Link>
          </li>
          <li className="mb-1">
            <button 
              onClick={handleLogout}
              className="w-full text-left flex items-center px-3 py-2 text-muted-foreground hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
      
      <div className="p-4 m-3 bg-accent rounded-xl">
        <div className="mb-2 text-sm text-foreground font-medium flex items-center">
          <HelpCircle className="w-4 h-4 mr-2" />
          Need help?
        </div>
        <p className="text-xs text-muted-foreground mb-3">Check our documentation</p>
        <Button 
          variant="outline" 
          className="w-full bg-background-light text-foreground text-sm py-2 rounded-lg hover:bg-opacity-80 transition-colors"
        >
          Documentation
        </Button>
      </div>
    </aside>
  );
}
