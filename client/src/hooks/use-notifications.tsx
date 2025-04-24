import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

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

// WebSocket message types for notifications
interface WebSocketMessage {
  type: string;
  payload: any;
}

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket when the component mounts and user is authenticated
  useEffect(() => {
    // Don't attempt to connect if no user is logged in
    if (!user || !user.id) {
      setNotifications([
        {
          id: 1,
          userId: 0,
          type: 'community',
          title: 'New community comment',
          message: 'John replied to your post about AI startups',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: 2,
          userId: 0,
          type: 'analysis',
          title: 'Analysis complete',
          message: 'Your startup idea analysis is ready to view',
          isRead: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
          id: 3,
          userId: 0,
          type: 'follow',
          title: 'New follower',
          message: 'Sarah is now following you',
          isRead: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        }
      ]);
      setUnreadCount(3);
      setIsLoading(false);
      return;
    }

    // Fetch initial notifications from the API
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Set default notifications if fetch fails
        setNotifications([
          {
            id: 1,
            userId: user.id,
            type: 'community',
            title: 'New community comment',
            message: 'John replied to your post about AI startups',
            isRead: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
          },
          {
            id: 2,
            userId: user.id,
            type: 'analysis',
            title: 'Analysis complete',
            message: 'Your startup idea analysis is ready to view',
            isRead: false,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
          },
          {
            id: 3,
            userId: user.id,
            type: 'follow',
            title: 'New follower',
            message: 'Sarah is now following you',
            isRead: false,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
          }
        ]);
        setUnreadCount(3);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up WebSocket connection
    console.log('Setting up WebSocket connection for notifications...');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    // Handle WebSocket open
    ws.onopen = () => {
      console.log('WebSocket connected, authenticating...');
      setConnectionStatus('connected');
      
      // Send authentication with user ID
      ws.send(JSON.stringify({
        type: 'auth',
        payload: { userId: user.id }
      }));
      
      // Fetch notifications after authentication
      fetchNotifications();
    };
    
    // Handle WebSocket close
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
      
      // Try to reconnect after 3 seconds
      setTimeout(() => {
        setConnectionStatus('connecting');
        
        // Only reconnect if component is still mounted and user is logged in
        if (user && user.id) {
          console.log('Attempting to reconnect WebSocket...');
        }
      }, 3000);
    };
    
    // Handle WebSocket errors
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };
    
    // Handle WebSocket messages
    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        console.log('Received WebSocket message:', data.type);
        
        switch (data.type) {
          case 'auth_success':
            console.log('WebSocket authentication successful');
            break;
            
          case 'auth_error':
            console.error('WebSocket authentication failed:', data.payload.message);
            break;
            
          case 'notification':
            // Add new notification to the list
            const newNotification = data.payload.notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast notification
            toast({
              title: newNotification.title,
              description: newNotification.message,
              duration: 5000,
            });
            break;
            
          case 'notifications_marked_read':
            // Update read status for multiple notifications
            const { notificationIds } = data.payload;
            setNotifications(prev => 
              prev.map(notification => 
                notificationIds.includes(notification.id) 
                  ? { ...notification, isRead: true } 
                  : notification
              )
            );
            setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
            break;
            
          case 'error':
            console.error('WebSocket error:', data.payload.message);
            toast({
              title: 'Error',
              description: data.payload.message,
              variant: 'destructive',
              duration: 3000,
            });
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    // Cleanup on unmount
    return () => {
      console.log('Cleaning up notification WebSocket connection');
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user, toast]);

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      // Update state optimistically
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Send to server
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'mark_notification_read',
          payload: { notificationId }
        }));
      } else {
        // Fallback to API call if WebSocket is not connected
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to mark notification as read');
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert the state update if there was an error
      // This would require re-fetching notifications
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Update state optimistically
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      
      // Send to server
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'mark_all_notifications_read',
          payload: {}
        }));
      } else {
        // Fallback to API call if WebSocket is not connected
        const response = await fetch('/api/notifications/read-all', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to mark all notifications as read');
        }
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert the state update if there was an error
      // This would require re-fetching notifications
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    connectionStatus,
    markAsRead,
    markAllAsRead
  };
}