import { useEffect } from "react";
import { ChatInterface } from "@/components/messaging/chat-interface";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function MessagesPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-t-2 border-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <ChatInterface />
    </div>
  );
}