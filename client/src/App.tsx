import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query"; 
import { AuthProvider } from "@/hooks/use-auth";
import { AuthDialogProvider } from "@/hooks/use-auth-dialog";
import { PremiumFeaturesProvider } from "@/hooks/use-premium-features";
import { queryClient } from "@/lib/queryClient";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import DashboardPage from "@/pages/dashboard-page";
import CommunityPage from "@/pages/community-page";
import ProfilePage from "@/pages/profile-page";
import MessagesPage from "@/pages/messages-page";
import AnalysisPage from "@/pages/analysis-page";
import DatabasePage from "@/pages/database-page";
import { ProtectedRoute } from "./lib/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";

function MainLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  
  // Show the full UI to all users, regardless of authentication status
  return (
    <div className="app-container">
      {/* Always show sidebar on desktop for all users */}
      {!isMobile && <Sidebar />}
      
      {/* Header shown for all pages, but transforms for mobile */}
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
        <Route path="/analysis" component={AnalysisPage} />
        <ProtectedRoute path="/community" component={CommunityPage} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/messages" component={MessagesPage} />
        <ProtectedRoute path="/profile/:username" component={ProfilePage} />
        <ProtectedRoute path="/database" component={DatabasePage} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthDialogProvider>
          <PremiumFeaturesProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </PremiumFeaturesProvider>
        </AuthDialogProvider>
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
