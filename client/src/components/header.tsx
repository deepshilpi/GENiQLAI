import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { 
  Home, 
  Bell, 
  Settings, 
  Search 
} from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const getPageTitle = () => {
    if (location === "/dashboard") return "Dashboard";
    if (location === "/community") return "Community";
    if (location === "/analytics") return "Analytics";
    if (location === "/market-news") return "Market News";
    if (location.startsWith("/profile")) return "Profile";
    return "";
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search
    console.log("Searching for:", searchTerm);
  };
  
  return (
    <header className="bg-card px-6 py-4 flex items-center justify-between border-b border-border sticky top-0 z-10">
      <div className="flex items-center">
        <div className="mr-2">
          <Home className="text-muted-foreground w-4 h-4" />
        </div>
        <span className="text-muted-foreground">/</span>
        <span className="ml-2 text-white font-medium">{getPageTitle()}</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="text-muted-foreground w-4 h-4" />
          </div>
          <Input
            type="text"
            className="py-2 pl-10 pr-4 rounded-lg bg-accent border border-border text-white placeholder-muted-foreground w-64 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Type here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        
        <button className="text-muted-foreground p-2 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        
        <button className="text-muted-foreground p-2 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        
        <Link href={`/profile/${user?.username}`}>
          <a className="flex items-center space-x-2 p-1 hover:bg-accent rounded-lg transition-colors">
            <span className="text-white text-sm">{user?.username}</span>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              {user?.username ? (
                <span className="text-sm font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              ) : (
                <i className="fas fa-user text-muted-foreground"></i>
              )}
            </div>
          </a>
        </Link>
      </div>
    </header>
  );
}
