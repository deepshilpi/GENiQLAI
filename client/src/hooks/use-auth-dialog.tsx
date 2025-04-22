import { createContext, ReactNode, useContext, useState } from "react";
import { AuthDialog } from "@/components/auth-dialog";

interface AuthDialogContextType {
  openAuthDialog: (options?: { defaultTab?: 'login' | 'register', returnTo?: string }) => void;
  closeAuthDialog: () => void;
}

const AuthDialogContext = createContext<AuthDialogContextType | null>(null);

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'login' | 'register'>('login');
  const [returnTo, setReturnTo] = useState<string | undefined>(undefined);

  const openAuthDialog = (options?: { defaultTab?: 'login' | 'register', returnTo?: string }) => {
    setDefaultTab(options?.defaultTab || 'login');
    setReturnTo(options?.returnTo);
    setIsOpen(true);
  };

  const closeAuthDialog = () => {
    setIsOpen(false);
  };

  return (
    <AuthDialogContext.Provider value={{ openAuthDialog, closeAuthDialog }}>
      {children}
      <AuthDialog 
        isOpen={isOpen} 
        onClose={closeAuthDialog} 
        defaultTab={defaultTab}
        returnTo={returnTo}
      />
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog() {
  const context = useContext(AuthDialogContext);
  if (!context) {
    throw new Error("useAuthDialog must be used within an AuthDialogProvider");
  }
  return context;
}