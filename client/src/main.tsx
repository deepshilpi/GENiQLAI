import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { AuthDialogProvider } from "./hooks/use-auth-dialog";
import { PremiumFeaturesProvider } from "./hooks/use-premium-features";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AuthDialogProvider>
        <PremiumFeaturesProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </PremiumFeaturesProvider>
      </AuthDialogProvider>
    </AuthProvider>
  </QueryClientProvider>
);
