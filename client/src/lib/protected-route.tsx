
import { Route, useLocation, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Enhanced ProtectedRoute component that ensures users are authenticated
 * before accessing protected content. Includes improved loading states,
 * better error handling, and animated transitions.
 */
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading, refetchUser } = useAuth();
  const [_, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  
  // Effect for handling auth check with better error recovery
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("[Protected Route] User not authenticated, preparing redirect");
      
      // Set redirecting state to show transitional UI
      setRedirecting(true);
      
      // Try one more refresh in case of temporary failure
      const attemptRefresh = async () => {
        try {
          const refreshedUser = await refetchUser();
          
          if (!refreshedUser) {
            // Still no user after refresh, redirect to auth
            const returnUrl = encodeURIComponent(path);
            navigate(`/auth?returnUrl=${returnUrl}`);
          }
        } catch (err) {
          console.error("[Protected Route] Auth check error:", err);
          setError("Authentication check failed. Please try again.");
        }
      };
      
      // Small delay before redirect for better UX
      const timer = setTimeout(() => {
        attemptRefresh();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, path, navigate, refetchUser]);

  return (
    <Route path={path}>
      {(params) => {
        // Show error state
        if (error) {
          return (
            <div className="flex items-center justify-center min-h-screen bg-background px-4">
              <Card className="max-w-md border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md w-full">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                      <ShieldAlert className="h-6 w-6 text-red-500" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-center text-white">Authentication Error</CardTitle>
                  <CardDescription className="text-white/70 text-center">
                    {error}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </CardFooter>
              </Card>
            </div>
          );
        }
        
        // Show loading state
        if (isLoading || redirecting) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-vision-purple-500" />
              <p className="text-sm text-white/70 animate-pulse">
                {redirecting ? "Redirecting to login..." : "Checking authentication..."}
              </p>
            </div>
          );
        }

        // If not authenticated, redirect to the auth page with return URL
        if (!user) {
          // Encode the current path to use as return URL after login
          const returnUrl = encodeURIComponent(path);
          return <Redirect to={`/auth?returnUrl=${returnUrl}`} />;
        }

        // User is authenticated, render the protected component
        return <Component {...params} />;
      }}
    </Route>
  );
}
