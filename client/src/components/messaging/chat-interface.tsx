import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, PlusCircle, User, Users } from "lucide-react";
import { format } from "date-fns";

// WebSocket message types
type WebSocketMessage = {
  type: string;
  payload: any;
};

// Message type
type Message = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
};

// Conversation type
type Conversation = {
  id: number;
  name: string | null;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
};

// User type
type User = {
  id: number;
  username: string;
  email: string;
  planType: string;
  bio: string;
};

// Conversation participant
type ConversationParticipant = {
  id: number;
  conversationId: number;
  userId: number;
  isAdmin: boolean;
  user?: User;
};

export function ChatInterface() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showConversationList, setShowConversationList] = useState(true);
  
  // Detect if we're on mobile
  const isMobile = useIsMobile();
  
  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect to WebSocket
  useEffect(() => {
    if (!user) return;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnectionStatus("connected");
        
        // Authenticate with the server
        ws.send(JSON.stringify({
          type: "auth",
          payload: { user }
        }));
      };
      
      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setConnectionStatus("disconnected");
        
        // Try to reconnect after 3 seconds
        setTimeout(() => {
          setConnectionStatus("connecting");
          connect();
        }, 3000);
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("disconnected");
      };
      
      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          switch (data.type) {
            case "auth_success":
              console.log("Authentication successful");
              
              // Request conversations
              ws.send(JSON.stringify({
                type: "get_conversations"
              }));
              break;
              
            case "unread_count":
              setUnreadCount(data.payload.count);
              break;
              
            case "conversations":
              setConversations(data.payload.conversations);
              setLoading(false);
              break;
              
            case "messages":
              setMessages(data.payload.messages.reverse()); // Reverse to show oldest first
              scrollToBottom();
              break;
              
            case "new_message":
              if (activeConversation && activeConversation.id === data.payload.message.conversationId) {
                setMessages(prev => [...prev, data.payload.message]);
                scrollToBottom();
                
                // Mark the message as read
                markMessageAsRead(data.payload.message.id);
              } else {
                // Update unread count
                setUnreadCount(prev => prev + 1);
                
                // Show toast notification
                toast({
                  title: "New Message",
                  description: "You have a new message",
                  duration: 3000,
                });
              }
              break;
              
            case "new_conversation":
              setConversations(prev => [data.payload.conversation, ...prev]);
              
              toast({
                title: "New Conversation",
                description: "You have been added to a new conversation",
                duration: 3000,
              });
              break;
              
            case "error":
              console.error("WebSocket error:", data.payload.message);
              toast({
                title: "Error",
                description: data.payload.message,
                variant: "destructive",
                duration: 3000,
              });
              break;
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    };
    
    connect();
    
    // Cleanup on unmount
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [user, toast]);
  
  // Set active conversation
  const setActiveConversationAndLoadMessages = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setLoading(true);
    
    // On mobile, hide the conversation list when a conversation is selected
    if (isMobile) {
      setShowConversationList(false);
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "get_messages",
        payload: {
          conversationId: conversation.id
        }
      }));
    }
  };
  
  // Send message
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation) return;
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "send_message",
        payload: {
          conversationId: activeConversation.id,
          content: newMessage
        }
      }));
      
      setNewMessage("");
    }
  };
  
  // Mark message as read
  const markMessageAsRead = (messageId: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "mark_read",
        payload: {
          messageId
        }
      }));
    }
  };
  
  // Create new conversation
  const createNewConversation = (recipientId: number, isGroup: boolean = false) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "create_conversation",
        payload: {
          participants: [user?.id, recipientId],
          isGroup
        }
      }));
    }
  };
  
  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Check if message is from current user
  const isCurrentUserMessage = (senderId: number) => {
    return user?.id === senderId;
  };
  
  // Get shortened date for conversation list
  const getShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return format(date, "h:mm a");
    } else if (date.getFullYear() === now.getFullYear()) {
      return format(date, "MMM d");
    } else {
      return format(date, "MMM d, yyyy");
    }
  };
  
  // Get conversation name
  const getConversationName = (conversation: Conversation) => {
    if (conversation.name) {
      return conversation.name;
    } else if (conversation.isGroup) {
      return "Group Chat";
    } else {
      // For one-on-one conversations, show the other user's name
      // This requires having participant info, which we can request
      return "Direct Message";
    }
  };

  return (
    <Card className="w-full h-[85vh] max-h-[85vh] shadow-md overflow-hidden">
      <Tabs defaultValue="chats" className="h-full flex flex-col">
        <CardHeader className="py-3 px-5 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Messages</CardTitle>
          <div className="flex items-center space-x-2">
            <TabsList>
              <TabsTrigger value="chats" className="relative">
                Chats
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden">
          <TabsContent value="chats" className="h-full flex">
            {/* Conversation list - full width on mobile when in list view, hidden when conversation is active */}
            {(!isMobile || (isMobile && showConversationList)) && (
              <div className={`${isMobile ? 'w-full' : 'w-1/3'} border-r h-full flex flex-col`}>
                <div className="p-3 border-b flex justify-between items-center">
                  <Input 
                    placeholder="Search conversations..." 
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" className="ml-2">
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  {loading ? (
                    <div className="flex items-center justify-center h-24">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center h-40 p-6">
                      <p className="text-sm text-muted-foreground mb-3">No conversations yet</p>
                      <Button variant="outline" size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Start a conversation
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`flex items-center p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                            activeConversation?.id === conversation.id ? "bg-accent" : ""
                          }`}
                          onClick={() => setActiveConversationAndLoadMessages(conversation)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {conversation.isGroup ? (
                                <Users className="h-5 w-5" />
                              ) : (
                                <User className="h-5 w-5" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3 flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium truncate">
                                {getConversationName(conversation)}
                              </p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {getShortDate(conversation.updatedAt)}
                              </span>
                            </div>
                            {/* Last message preview can be added here if we track it */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
            
            {/* Message area - only show when not showing conversation list on mobile */}
            {(!isMobile || (isMobile && !showConversationList)) && (
              <div className={`${isMobile ? 'w-full' : 'w-2/3'} flex flex-col h-full`}>
                {!activeConversation ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="rounded-full bg-accent p-4 mb-4">
                      <Send className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">Your Messages</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4 text-center max-w-sm">
                      Send private messages to other entrepreneurs and investors
                    </p>
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Message
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="p-3 border-b flex items-center justify-between">
                      <div className="flex items-center">
                        {/* Back button on mobile */}
                        {isMobile && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="mr-2"
                            onClick={() => setShowConversationList(true)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <path d="m15 18-6-6 6-6"/>
                            </svg>
                          </Button>
                        )}
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {activeConversation.isGroup ? 
                              <Users className="h-5 w-5" /> : 
                              <User className="h-5 w-5" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <h3 className="text-sm font-semibold">
                            {getConversationName(activeConversation)}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {activeConversation.isGroup ? "Group chat" : "Direct message"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4">
                      {loading ? (
                        <div className="flex items-center justify-center h-24">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center h-40">
                          <p className="text-sm text-muted-foreground">No messages yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => {
                            const isCurrentUser = isCurrentUserMessage(message.senderId);
                            
                            return (
                              <div
                                key={message.id}
                                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                              >
                                <div className="flex max-w-[85%] md:max-w-[70%]">
                                  {!isCurrentUser && (
                                    <Avatar className="h-8 w-8 mr-2 mt-1 hidden sm:block">
                                      <AvatarFallback>
                                        <User className="h-4 w-4" />
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                  <div>
                                    <div
                                      className={`p-3 rounded-xl ${
                                        isCurrentUser
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-accent"
                                      }`}
                                    >
                                      <p className="text-sm">{message.content}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {format(new Date(message.createdAt), "h:mm a")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>
                    
                    <CardFooter className="p-3 border-t">
                      <form onSubmit={sendMessage} className="flex w-full gap-2">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 h-10 min-h-10 py-2"
                        />
                        <Button 
                          type="submit" 
                          disabled={!newMessage.trim() || connectionStatus !== "connected"}
                        >
                          <Send className="h-4 w-4" />
                          <span className="sr-only">Send</span>
                        </Button>
                      </form>
                    </CardFooter>
                  </>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="users" className="h-full">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Start a Conversation</h3>
              {/* User list would go here - connect with users from the community */}
              <p className="text-sm text-muted-foreground">
                You'll be able to start new conversations with community members here.
              </p>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}