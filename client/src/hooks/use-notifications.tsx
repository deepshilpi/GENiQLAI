// Fix for authentication-related issues in the notifications system
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from './use-websocket';
import { WebSocketMessage, WebSocketStatus } from '@/lib/websocket-service';

// Type definitions for notifications
export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  icon?: string;
  data?: any;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  connectionStatus: WebSocketStatus;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => Promise<Notification[]>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const { status: connectionStatus, subscribe, sendMessage } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch notifications function
  const fetchNotifications = useCallback(async (): Promise<Notification[]> => {
    if (!user || !user.id) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return [];
    }
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      try {
        // Always attempt to parse as JSON, regardless of content-type header
        // This is because some servers may not set the correct content-type
        const data = await response.json();
        
        // Validate that we have the expected data structure
        if (data && typeof data === 'object') {
          const notificationsList = Array.isArray(data.notifications) ? data.notifications : [];
          const unreadCountValue = typeof data.unreadCount === 'number' ? data.unreadCount : 0;
          
          setNotifications(notificationsList);
          setUnreadCount(unreadCountValue);
          setIsLoading(false);
          return notificationsList;
        } else {
          // Empty state if response structure is unexpected
          console.log('Invalid response structure from notifications API');
          setNotifications([]);
          setUnreadCount(0);
          setIsLoading(false);
          return [];
        }
      } catch (jsonError) {
        console.error('Error parsing JSON from notifications API:', jsonError);
        setNotifications([]);
        setUnreadCount(0);
        setIsLoading(false);
        return [];
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return [];
    }
  }, [user]);
  
  // Handle incoming WebSocket messages for notifications
  const handleNotification = useCallback((message: WebSocketMessage) => {
    if (message.type === 'notification' && message.payload?.notification) {
      // Add new notification to the list
      const newNotification = message.payload.notification;
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast({
        title: newNotification.title,
        description: newNotification.message,
        duration: 5000,
      });
    } else if (message.type === 'unread_count' && message.payload?.count !== undefined) {
      setUnreadCount(message.payload.count);
    } else if (message.type === 'notifications_marked_read' && message.payload?.notificationIds) {
      const { notificationIds } = message.payload;
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id) 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    }
  }, [toast]);
  
  // Subscribe to relevant WebSocket events
  useEffect(() => {
    if (!user || !user.id) {
      setIsLoading(false);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    // Initial fetch of notifications
    fetchNotifications();
    
    // Subscribe to WebSocket notifications
    const unsubscribeNotification = subscribe('notification', handleNotification);
    const unsubscribeUnreadCount = subscribe('unread_count', handleNotification);
    const unsubscribeMarkedRead = subscribe('notifications_marked_read', handleNotification);
    
    // Clean up subscriptions when component unmounts
    return () => {
      unsubscribeNotification();
      unsubscribeUnreadCount();
      unsubscribeMarkedRead();
    };
  }, [user, fetchNotifications, handleNotification, subscribe]);
  
  // Mark a single notification as read
  const markAsRead = useCallback((notificationId: number) => {
    if (!user || !user.id) return;
    
    // Convert single ID to array for reuse in existing logic
    const notificationIds = [notificationId];
    
    // Optimistic UI update
    setNotifications(prev => 
      prev.map(notification => 
        notificationIds.includes(notification.id) 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    
    // Send message through WebSocket
    sendMessage({
      type: 'mark_read',
      payload: { notificationIds }
    });
    
    // Fallback API call to ensure synchronization
    fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationIds })
    }).catch(error => {
      console.error('Error marking notifications as read:', error);
    });
  }, [user, sendMessage]);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    if (!user || !user.id || !notifications.length) return;
    
    // Get all unread notification IDs
    const unreadIds = notifications
      .filter(notification => !notification.isRead)
      .map(notification => notification.id);
    
    if (unreadIds.length === 0) return;
    
    // Optimistic UI update
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
    
    // Send message through WebSocket
    sendMessage({
      type: 'mark_all_read',
      payload: { notificationIds: unreadIds }
    });
    
    // Fallback API call to ensure synchronization
    fetch('/api/notifications/mark-all-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationIds: unreadIds })
    }).catch(error => {
      console.error('Error marking all notifications as read:', error);
    });
  }, [user, notifications, sendMessage]);
  
  return {
    notifications,
    unreadCount,
    isLoading,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    fetchNotifications
  };
}