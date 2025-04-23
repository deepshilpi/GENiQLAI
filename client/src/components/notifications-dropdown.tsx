import React from "react";
import { useLocation } from "wouter";
import { Bell, MessageSquare, BrainCircuit, User, CheckCircle, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications, formatRelativeTime, downloadNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface NotificationsDropdownProps {
  className?: string;
  iconSize?: "sm" | "md" | "lg";
}

export function NotificationsDropdown({ className, iconSize = "md" }: NotificationsDropdownProps) {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const iconSizeClass = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };
  
  const buttonSizeClass = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-9 h-9"
  };
  
  const indicatorSizeClass = {
    sm: "w-3 h-3 text-[8px]",
    md: "w-4 h-4 text-[10px]",
    lg: "w-5 h-5 text-[11px]"
  };
  
  const getIconForType = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-4 h-4" />;
      case 'analysis':
        return <BrainCircuit className="w-4 h-4" />;
      case 'follower':
        return <User className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };
  
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };
  
  const handleExport = () => {
    downloadNotifications();
    toast({
      title: "Notifications Exported",
      description: "Your notifications have been exported as a JSON file.",
      variant: "default"
    });
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "All Notifications Marked as Read",
      description: "You've cleared all your notification alerts.",
      variant: "default"
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "text-white/70 hover:text-white hover:bg-vision-purple-100/10 rounded-lg", 
            buttonSizeClass[iconSize],
            className
          )}
        >
          <div className="relative">
            <Bell className={iconSizeClass[iconSize]} />
            {unreadCount > 0 && (
              <span 
                className={cn(
                  "absolute -top-1 -right-1 bg-red-500 rounded-full flex items-center justify-center text-white font-bold",
                  indicatorSizeClass[iconSize]
                )}
              >
                {unreadCount}
              </span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/10 text-white w-80"
      >
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge className="bg-vision-primary-gradient text-white text-xs py-0">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-vision-purple-200/10" />
        
        {/* Notification list */}
        <div className="max-h-96 overflow-y-auto py-1">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={cn(
                  "cursor-pointer hover:bg-vision-purple-100/10 flex flex-col items-start py-3",
                  !notification.read && "bg-vision-purple-100/5"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-2",
                    notification.iconClassName
                  )}>
                    {getIconForType(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{notification.title}</p>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-red-500 ml-2"></span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-1">{notification.content}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-white/70">No notifications</p>
              <p className="text-xs text-white/50 mt-1">You're all caught up!</p>
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-vision-purple-200/10" />
            <div className="p-2 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-white/70 border-vision-purple-200/20 hover:bg-vision-purple-100/10 hover:text-white"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-white/70 border-vision-purple-200/20 hover:bg-vision-purple-100/10 hover:text-white"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}