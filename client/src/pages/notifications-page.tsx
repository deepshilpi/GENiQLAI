import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Bell, Check, User, Heart, MessageSquare, UserPlus, Trash2, ChevronRight, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/use-auth";

// Define notification types
type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'vote';

interface Notification {
  id: number;
  type: NotificationType;
  fromUser: {
    id: number;
    username: string;
    profilePic?: string;
  };
  postId?: number;
  postTitle?: string;
  commentId?: number;
  commentContent?: string;
  createdAt: string;
  read: boolean;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Fetch notifications
  const { data: notifications, isLoading, refetch } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const res = await fetch(`/api/notifications?filter=${activeTab}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch notifications');
        return res.json();
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    },
    enabled: !!user,
  });
  
  // Fetch notifications when tab changes
  useEffect(() => {
    refetch();
  }, [activeTab, refetch]);
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
      });
      refetch();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };
  
  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await fetch('/api/notifications/clear-all', {
        method: 'DELETE',
        credentials: 'include',
      });
      refetch();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark notification as read if needed
    if (!notification.read) {
      fetch(`/api/notifications/${notification.id}/mark-read`, {
        method: 'POST',
        credentials: 'include',
      }).catch(error => {
        console.error('Error marking notification as read:', error);
      });
    }
    
    // Navigate based on notification type
    if (notification.type === 'like' || notification.type === 'comment' || notification.type === 'vote') {
      navigate(`/community/post/${notification.postId}`);
    } else if (notification.type === 'follow') {
      navigate(`/profile/${notification.fromUser.username}`);
    } else if (notification.type === 'mention') {
      navigate(`/community/post/${notification.postId}`);
    }
  };
  
  // Get notification icon
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-pink-400" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-[#A163F7]" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-400" />;
      case 'mention':
        return <User className="h-4 w-4 text-blue-400" />;
      case 'vote':
        return <Check className="h-4 w-4 text-purple-400" />;
      default:
        return <Bell className="h-4 w-4 text-[#A163F7]" />;
    }
  };
  
  // Get notification message
  const getNotificationMessage = (notification: Notification) => {
    const username = notification.fromUser.username;
    
    switch (notification.type) {
      case 'like':
        return <><span className="font-medium text-white">{username}</span> liked your post <span className="font-medium text-white">"{notification.postTitle}"</span></>;
      case 'comment':
        return <><span className="font-medium text-white">{username}</span> commented on your post <span className="font-medium text-white">"{notification.postTitle}"</span></>;
      case 'follow':
        return <><span className="font-medium text-white">{username}</span> started following you</>;
      case 'mention':
        return <><span className="font-medium text-white">{username}</span> mentioned you in a comment</>;
      case 'vote':
        return <><span className="font-medium text-white">{username}</span> voted on your post <span className="font-medium text-white">"{notification.postTitle}"</span></>;
      default:
        return <span className="font-medium text-white">{username}</span>;
    }
  };
  
  // Format notification time
  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return format(date, "h:mm a");
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };
  
  // Handle delete notification
  const handleDeleteNotification = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      refetch();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications || [];
  const unreadCount = filteredNotifications.filter(n => !n.read).length;
  
  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#0B1437]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col w-full max-w-full transition-all duration-300">
        <Header />
        
        <main className="overflow-y-auto w-full h-full pt-6">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#CB9FFF]" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="bg-[#A163F7] hover:bg-[#7551FF] ml-2">
                    {unreadCount} new
                  </Badge>
                )}
              </h1>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                  className="border-[#A163F7]/20 bg-[#11083C]/70 text-[#CB9FFF] text-xs hover:bg-[#A163F7]/20 hover:text-white rounded-lg"
                >
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Mark all read
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearAllNotifications}
                  className="border-[#A163F7]/20 bg-[#11083C]/70 text-[#CB9FFF] text-xs hover:bg-[#A163F7]/20 hover:text-white rounded-lg"
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Clear all
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4 bg-[#11083C]/80 rounded-lg p-1">
                <TabsTrigger value="all" className="text-[#a09dd2] data-[state=active]:text-white data-[state=active]:bg-[#A163F7]/20 rounded-md">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-[#a09dd2] data-[state=active]:text-white data-[state=active]:bg-[#A163F7]/20 rounded-md">
                  Unread
                </TabsTrigger>
                <TabsTrigger value="mentions" className="text-[#a09dd2] data-[state=active]:text-white data-[state=active]:bg-[#A163F7]/20 rounded-md">
                  Mentions
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <div className="bg-[#11083C]/50 border border-[#A163F7]/20 backdrop-blur-sm rounded-xl overflow-hidden">
                  {isLoading ? (
                    // Loading skeletons
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="p-4 border-b border-[#A163F7]/10 last:border-0">
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-10 w-10 rounded-full bg-[#A163F7]/10" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full bg-[#A163F7]/10" />
                            <Skeleton className="h-3 w-24 bg-[#A163F7]/10" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border-b border-[#A163F7]/10 last:border-0 hover:bg-[#A163F7]/5 cursor-pointer transition-colors ${!notification.read ? 'bg-[#A163F7]/10' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 border-2 border-[#A163F7]/30">
                            {notification.fromUser.profilePic ? (
                              <AvatarImage src={notification.fromUser.profilePic} alt={notification.fromUser.username} />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-[#7551FF] to-[#A163F7] text-white">
                                {notification.fromUser.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-[#a09dd2] text-sm">
                                  {getNotificationMessage(notification)}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-[#11083C]/80 border border-[#A163F7]/30">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <span className="text-xs text-[#a09dd2]">
                                    {formatNotificationTime(notification.createdAt)}
                                  </span>
                                  {!notification.read && (
                                    <div className="h-2 w-2 rounded-full bg-[#A163F7]"></div>
                                  )}
                                </div>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-[#a09dd2] hover:text-white hover:bg-[#A163F7]/10 rounded-full"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="min-w-[180px] bg-[#11083C]/95 backdrop-blur-xl border border-[#A163F7]/20 text-white">
                                  {!notification.read && (
                                    <DropdownMenuItem 
                                      className="hover:bg-[#A163F7]/20 text-[#a09dd2] hover:text-white"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        fetch(`/api/notifications/${notification.id}/mark-read`, {
                                          method: 'POST',
                                          credentials: 'include',
                                        }).then(() => refetch());
                                      }}
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    className="hover:bg-[#A163F7]/20 text-[#a09dd2] hover:text-white"
                                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <div className="mx-auto h-12 w-12 rounded-full bg-[#11083C] flex items-center justify-center mb-3 border border-[#A163F7]/30">
                        <Bell className="h-6 w-6 text-[#A163F7]" />
                      </div>
                      <h3 className="text-white font-medium">No notifications</h3>
                      <p className="text-[#a09dd2] text-sm mt-1">You're all caught up!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="unread" className="mt-0">
                <div className="bg-[#11083C]/50 border border-[#A163F7]/20 backdrop-blur-sm rounded-xl overflow-hidden">
                  {isLoading ? (
                    // Loading skeletons
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="p-4 border-b border-[#A163F7]/10 last:border-0">
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-10 w-10 rounded-full bg-[#A163F7]/10" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full bg-[#A163F7]/10" />
                            <Skeleton className="h-3 w-24 bg-[#A163F7]/10" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : filteredNotifications.filter(n => !n.read).length > 0 ? (
                    filteredNotifications.filter(n => !n.read).map((notification) => (
                      <div 
                        key={notification.id} 
                        className="p-4 border-b border-[#A163F7]/10 last:border-0 hover:bg-[#A163F7]/5 bg-[#A163F7]/10 cursor-pointer transition-colors"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 border-2 border-[#A163F7]/30">
                            {notification.fromUser.profilePic ? (
                              <AvatarImage src={notification.fromUser.profilePic} alt={notification.fromUser.username} />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-[#7551FF] to-[#A163F7] text-white">
                                {notification.fromUser.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-[#a09dd2] text-sm">
                                  {getNotificationMessage(notification)}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-[#11083C]/80 border border-[#A163F7]/30">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <span className="text-xs text-[#a09dd2]">
                                    {formatNotificationTime(notification.createdAt)}
                                  </span>
                                  <div className="h-2 w-2 rounded-full bg-[#A163F7]"></div>
                                </div>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-[#a09dd2] hover:text-white hover:bg-[#A163F7]/10 rounded-full"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="min-w-[180px] bg-[#11083C]/95 backdrop-blur-xl border border-[#A163F7]/20 text-white">
                                  <DropdownMenuItem 
                                    className="hover:bg-[#A163F7]/20 text-[#a09dd2] hover:text-white"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fetch(`/api/notifications/${notification.id}/mark-read`, {
                                        method: 'POST',
                                        credentials: 'include',
                                      }).then(() => refetch());
                                    }}
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Mark as read
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="hover:bg-[#A163F7]/20 text-[#a09dd2] hover:text-white"
                                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <div className="mx-auto h-12 w-12 rounded-full bg-[#11083C] flex items-center justify-center mb-3 border border-[#A163F7]/30">
                        <Check className="h-6 w-6 text-[#A163F7]" />
                      </div>
                      <h3 className="text-white font-medium">All caught up!</h3>
                      <p className="text-[#a09dd2] text-sm mt-1">You have no unread notifications</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="mentions" className="mt-0">
                <div className="bg-[#11083C]/50 border border-[#A163F7]/20 backdrop-blur-sm rounded-xl overflow-hidden">
                  {isLoading ? (
                    // Loading skeletons
                    Array(2).fill(0).map((_, i) => (
                      <div key={i} className="p-4 border-b border-[#A163F7]/10 last:border-0">
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-10 w-10 rounded-full bg-[#A163F7]/10" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full bg-[#A163F7]/10" />
                            <Skeleton className="h-3 w-24 bg-[#A163F7]/10" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : filteredNotifications.filter(n => n.type === 'mention').length > 0 ? (
                    filteredNotifications.filter(n => n.type === 'mention').map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border-b border-[#A163F7]/10 last:border-0 hover:bg-[#A163F7]/5 cursor-pointer transition-colors ${!notification.read ? 'bg-[#A163F7]/10' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 border-2 border-[#A163F7]/30">
                            {notification.fromUser.profilePic ? (
                              <AvatarImage src={notification.fromUser.profilePic} alt={notification.fromUser.username} />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-[#7551FF] to-[#A163F7] text-white">
                                {notification.fromUser.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-[#a09dd2] text-sm">
                                  {getNotificationMessage(notification)}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-[#11083C]/80 border border-[#A163F7]/30">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <span className="text-xs text-[#a09dd2]">
                                    {formatNotificationTime(notification.createdAt)}
                                  </span>
                                  {!notification.read && (
                                    <div className="h-2 w-2 rounded-full bg-[#A163F7]"></div>
                                  )}
                                </div>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-[#a09dd2] hover:text-white hover:bg-[#A163F7]/10 rounded-full"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="min-w-[180px] bg-[#11083C]/95 backdrop-blur-xl border border-[#A163F7]/20 text-white">
                                  {!notification.read && (
                                    <DropdownMenuItem 
                                      className="hover:bg-[#A163F7]/20 text-[#a09dd2] hover:text-white"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        fetch(`/api/notifications/${notification.id}/mark-read`, {
                                          method: 'POST',
                                          credentials: 'include',
                                        }).then(() => refetch());
                                      }}
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    className="hover:bg-[#A163F7]/20 text-[#a09dd2] hover:text-white"
                                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <div className="mx-auto h-12 w-12 rounded-full bg-[#11083C] flex items-center justify-center mb-3 border border-[#A163F7]/30">
                        <User className="h-6 w-6 text-[#A163F7]" />
                      </div>
                      <h3 className="text-white font-medium">No mentions</h3>
                      <p className="text-[#a09dd2] text-sm mt-1">You haven't been mentioned in any posts or comments</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}