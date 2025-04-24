import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export function AuthDebugger() {
  const auth = useAuth();
  const { toast } = useToast();
  const [sessionInfo, setSessionInfo] = useState<{
    hasCookie: boolean;
    cookieValue: string;
    sessionId: string | null;
  }>({
    hasCookie: false,
    cookieValue: "",
    sessionId: null,
  });

  // Check cookies on mount
  useEffect(() => {
    const checkCookies = () => {
      const allCookies = document.cookie;
      const hasCookie = /connect\.sid/.test(allCookies);
      
      // Extract session ID from cookie (only for debugging)
      const sidMatch = allCookies.match(/connect\.sid=([^;]+)/);
      const sidValue = sidMatch ? sidMatch[1] : "";
      
      setSessionInfo({
        hasCookie,
        cookieValue: allCookies,
        sessionId: hasCookie ? sidValue : null,
      });
    };

    checkCookies();
    // Check cookies every 2 seconds
    const interval = setInterval(checkCookies, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Force a direct check on the backend
  const performDirectCheck = async () => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/user?_t=${timestamp}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (res.ok) {
        const userData = await res.json();
        toast({
          title: "Direct API check successful",
          description: `User found: ${userData.username}`,
        });
      } else {
        toast({
          title: "Direct API check failed",
          description: `Status: ${res.status} ${res.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Direct API check error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Force refresh the auth state
  const forceRefresh = async () => {
    try {
      const user = await auth.refetchUser();
      toast({
        title: user ? "Refreshed with user" : "Refreshed with no user",
        description: user ? `User: ${user.username}` : "No user found in session",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };
  
  // Force a hard refresh of the page
  const forceHardRefresh = () => {
    window.location.reload();
  };

  if (!auth.user && !sessionInfo.hasCookie) {
    return null; // Don't show debugger when clearly not logged in
  }

  // Authentication state mismatch detected - show debugger
  const mismatchDetected = (sessionInfo.hasCookie && !auth.user) || 
                          (!sessionInfo.hasCookie && auth.user);

  return (
    <div className={`auth-debugger p-4 rounded-lg mb-4 text-sm ${mismatchDetected ? "bg-red-950/40 border border-red-500/50" : "bg-green-950/40 border border-green-500/50"}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Authentication Status</h3>
        <span className={`px-2 py-0.5 rounded text-xs ${auth.user ? "bg-green-700/60" : "bg-red-700/60"}`}>
          {auth.user ? "✓ Authenticated" : "✗ Not Authenticated"}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div>
          <span className="opacity-70">User:</span>{" "}
          {auth.user ? auth.user.username : "None"}
        </div>
        <div>
          <span className="opacity-70">Session Cookie:</span>{" "}
          {sessionInfo.hasCookie ? "Present" : "Missing"}
        </div>
        <div>
          <span className="opacity-70">Loading:</span>{" "}
          {auth.isLoading ? "Yes" : "No"}
        </div>
        <div>
          <span className="opacity-70">Mutation:</span>{" "}
          {auth.loginMutation.isPending ? "In progress" : "Idle"}
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-7 bg-transparent"
          onClick={performDirectCheck}
        >
          Direct API Check
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-7 bg-transparent"
          onClick={forceRefresh}
        >
          Force Refresh
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-7 bg-transparent"
          onClick={forceHardRefresh}
        >
          Hard Refresh
        </Button>
      </div>
    </div>
  );
}