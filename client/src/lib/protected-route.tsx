
import { Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const [location] = useLocation();
  
  // If the current path matches this protected route and user isn't authenticated,
  // show the auth dialog
  useEffect(() => {
    if (!isLoading && !user && location === path) {
      openAuthDialog({ 
        defaultTab: "login",
        returnTo: path
      });
    }
  }, [user, isLoading, location, path, openAuthDialog]);

  return (
    <Route path={path}>
      {(params) => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-vision-purple-700" />
            </div>
          );
        }

        // If not authenticated, render a placeholder or restricted version
        if (!user) {
          return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
                <p className="text-white/70 mb-6">
                  You need to sign in or create an account to access this page.
                </p>
                <button
                  onClick={() => openAuthDialog({ defaultTab: "login", returnTo: path })}
                  className="py-2 px-4 bg-vision-primary-gradient rounded-md text-white hover:brightness-110 transition-all"
                >
                  Sign In / Register
                </button>
              </div>
            </div>
          );
        }

        return <Component {...params} />;
      }}
    </Route>
  );
}
