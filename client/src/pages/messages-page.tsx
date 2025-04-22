import { useEffect } from "react";
import { ChatInterface } from "@/components/messaging/chat-interface";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MessagesPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { openAuthDialog } = useAuthDialog();

  // Handle authentication - show auth dialog instead of redirect for better UX
  useEffect(() => {
    if (!isLoading && !user) {
      openAuthDialog({ 
        defaultTab: 'login',
        returnTo: '/messages'
      });
    }
  }, [user, isLoading, openAuthDialog]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="animate-spin w-10 h-10 border-t-2 border-b-2 border-vision-purple-500 rounded-full" />
      </div>
    );
  }

  // If user is not logged in, show a prompt to login
  if (!user) {
    return (
      <div className="container max-w-7xl mx-auto py-10 px-4 md:px-6 flex flex-col items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="vision-card p-8 md:p-12 rounded-2xl bg-vision-card/90 backdrop-blur-md border border-vision-purple-200/10 max-w-lg w-full text-center">
          <div className="mb-6 bg-vision-primary-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Private Messaging</h1>
          <p className="text-white/70 mb-8">
            Connect with entrepreneurs and investors through our secure messaging platform. Please log in to access your messages.
          </p>
          <Button 
            onClick={() => openAuthDialog({ defaultTab: 'login', returnTo: '/messages' })}
            className="bg-vision-primary-gradient hover:bg-vision-primary-gradient/90 text-white px-8 py-6 h-auto text-lg"
          >
            Log In to Access Messages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <div className="bg-vision-primary-gradient/20 p-2 rounded-lg mr-3">
          <Mail className="h-5 w-5 text-vision-purple-500" />
        </div>
        <h1 className="text-2xl font-bold text-white">Messages</h1>
      </div>
      <ChatInterface />
    </div>
  );
}