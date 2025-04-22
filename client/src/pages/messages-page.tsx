import { useEffect } from "react";
import { ChatInterface } from "@/components/messaging/chat-interface";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";

export default function MessagesPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'px-0 py-2' : 'container mx-auto py-6 px-4'}`}>
      {!isMobile && <h1 className="text-2xl font-bold mb-6">Messages</h1>}
      <ChatInterface />
    </div>
  );
}