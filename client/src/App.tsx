import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import DashboardPage from "@/pages/dashboard-page";
import CommunityPage from "@/pages/community-page";
import ProfilePage from "@/pages/profile-page";
import MessagesPage from "@/pages/messages-page";
import AnalysisPage from "@/pages/analysis-page";
import SettingsPage from "@/pages/settings-page";
import TermsPage from "@/pages/terms-page";
import PrivacyPage from "@/pages/privacy-page";
import { ProtectedRoute } from "./lib/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuthDialogProvider } from "@/hooks/use-auth-dialog";
import { PremiumFeaturesProvider } from "@/hooks/use-premium-features";

function MainLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  
  // Show the full UI to all users, regardless of authentication status
  return (
    <div className="app-container min-h-screen flex flex-col">
      {/* Always show sidebar on desktop for all users */}
      {!isMobile && <Sidebar />}
      
      {/* Header shown for all pages, but transforms for mobile */}
      <Header />
      
      <main className={`main-content flex-1 ${isMobile ? 'pt-16' : ''}`}>
        {children}
      </main>
      
      {/* Footer always shown at bottom */}
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={AnalysisPage} />
        <Route path="/home" component={HomePage} />
        <ProtectedRoute path="/community" component={CommunityPage} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/messages" component={MessagesPage} />
        <ProtectedRoute path="/profile/:username" component={ProfilePage} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <>
      <AuthDialogProvider>
        <PremiumFeaturesProvider>
          <Toaster />
          <Router />
        </PremiumFeaturesProvider>
      </AuthDialogProvider>
    </>
  );
}

export default App;
