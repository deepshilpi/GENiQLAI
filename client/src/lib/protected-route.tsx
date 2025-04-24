
import { Route, useLocation, Redirect } from "wouter";
import { AuthContext } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useContext } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const isLoading = auth?.isLoading || false;
  const [location, setLocation] = useLocation();

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

        // If not authenticated, redirect to the auth page with return URL
        if (!user) {
          // Encode the current path to use as return URL after login
          const returnUrl = encodeURIComponent(path);
          return <Redirect to={`/auth?returnUrl=${returnUrl}`} />;
        }

        return <Component {...params} />;
      }}
    </Route>
  );
}
