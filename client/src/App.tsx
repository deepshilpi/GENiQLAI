import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query"; 
import { queryClient } from "@/lib/queryClient";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import CommunityPage from "@/pages/community-page";
import { Header } from "@/components/header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";

function MainLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  
  return (
    <div className="app-container">
      {/* Header transforms for mobile */}
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
        <Route path="/community" component={CommunityPage} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
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
