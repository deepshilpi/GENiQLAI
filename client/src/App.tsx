import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query"; 
import { AuthProvider } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import DashboardPage from "@/pages/dashboard-page";
import CommunityPage from "@/pages/community-page";
import ProfilePage from "@/pages/profile-page";
import { ProtectedRoute } from "./lib/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

function MainLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Public pages don't need layout with sidebar
  const isPublicPage = ['/auth'].includes(location) || !user;
  
  if (isPublicPage) {
    return <>{children}</>;
  }
  
  return (
    <div className="app-container">
      {/* Only show sidebar on desktop */}
      {!isMobile && <Sidebar />}
      
      {/* Header is always shown but transforms to mobile version on smaller screens */}
      <Header />
      
      <main className={`main-content ${isMobile ? 'pt-16' : ''}`}>
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/community" component={CommunityPage} />
        <ProtectedRoute path="/profile/:username" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <AppProviders>
      <Toaster />
      <Router />
    </AppProviders>
  );
}

export default App;
