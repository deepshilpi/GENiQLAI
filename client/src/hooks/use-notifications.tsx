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
  
  // WebSocket reference using any to avoid TypeScript complaints about nested properties
  const wsRef = useRef<any>(null);

  // Track connection attempts
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Connect to WebSocket when the component mounts and user is authenticated
  useEffect(() => {
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Don't attempt to connect if no user is logged in
    if (!user || !user.id) {
      setIsLoading(false);
      setConnectionStatus('disconnected');
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Set up WebSocket connection with reconnection logic
    const setupWebSocket = () => {
      // Clear any existing WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    
      // Fetch initial notifications from the API
      const fetchNotifications = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/notifications');
          
          if (!response.ok) {
            throw new Error('Failed to fetch notifications');
          }
          
          const data = await response.json();
          if (data?.notifications) {
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
          } else {
            // Return to empty state if no proper response
            setNotifications([]);
            setUnreadCount(0);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error instanceof Error ? error.message : 'Unknown error');
          // Set to empty state instead of mock data
          setNotifications([]);
          setUnreadCount(0);
        } finally {
          setIsLoading(false);
        }
      };

      try {
        // Set up WebSocket connection
        if (connectionStatus !== 'connecting') {
          setConnectionStatus('connecting');
        }
        
        // Use a more resilient WebSocket setup with timeout
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log(`Connecting to WebSocket at ${wsUrl}`);
        
        // Close any existing connection
        if (wsRef.current) {
          // Use try-catch to handle any errors during close
          try {
            // TypeScript safety with any type to avoid readyState complaints
            const currentWs = wsRef.current;
            if (currentWs && currentWs.readyState !== 3) { // 3 = CLOSED
              currentWs.close();
            }
          } catch (e) {
            // Ignore errors when closing
            console.error('Error closing existing WebSocket:', e);
          }
        }
        
        // Create new connection
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        
        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState !== 1) { // 1 = OPEN
            console.log('WebSocket connection timed out after 10 seconds');
            ws.close();
          }
        }, 10000);
        
        // Implement a ping/pong heartbeat to keep connection alive
        let pingInterval: NodeJS.Timeout | null = null;
        
        // Handle WebSocket open
        ws.onopen = () => {
          // Clear connection timeout since we're now connected
          clearTimeout(connectionTimeout);
          
          console.log('WebSocket connected, authenticating...');
          setConnectionStatus('connected');
          reconnectAttempts.current = 0; // Reset the counter on successful connection
          
          // Send authentication with user ID
          ws.send(JSON.stringify({
            type: 'auth',
            payload: { userId: user.id }
          }));
          console.log('Authentication message sent');
          
          // Set up ping/pong heartbeat every 15 seconds to keep connection alive
          pingInterval = setInterval(() => {
            if (ws.readyState === 1) { // 1 = OPEN
              try {
                console.log('Sending ping to keep connection alive');
                ws.send(JSON.stringify({ type: 'ping' }));
              } catch (err) {
                console.error('Error sending ping:', err);
                // If we can't send a ping, the connection might be broken
                // Close it so our reconnect logic can kick in
                try {
                  ws.close();
                } catch (closeErr) {
                  // Ignore close errors
                }
              }
            }
          }, 15000);
          
          // Fetch notifications after authentication
          fetchNotifications();
        };
        
        // Handle WebSocket close with exponential backoff
        ws.onclose = () => {
          if (pingInterval) {
            clearInterval(pingInterval);
          }
          
          console.log('WebSocket disconnected');
          setConnectionStatus('disconnected');
          
          // Implement exponential backoff for reconnection
          const maxReconnectDelay = 30000; // 30 seconds max
          const baseDelay = 1000; // 1 second base
          const delay = Math.min(
            maxReconnectDelay, 
            baseDelay * Math.pow(2, reconnectAttempts.current)
          );
          
          reconnectAttempts.current += 1;
          
          // Try to reconnect with backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            if (user && user.id && document.visibilityState === 'visible') {
              setupWebSocket();
            }
          }, delay);
        };
        
        // Handle WebSocket errors
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          // We don't need to set status to disconnected here as onclose will be called after onerror
        };
        
        // Handle WebSocket messages
        ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            // Reduce console spam by only logging important messages
            if (data.type !== 'pong') {
              console.log('Received WebSocket message:', data.type);
            }
            
            switch (data.type) {
              case 'auth_success':
                console.log('Authentication successful');
                break;
                
              case 'auth_error':
                console.error('WebSocket authentication failed:', data.payload?.message);
                break;
                
              case 'notification':
                if (data.payload?.notification) {
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
                }
                break;
                
              case 'unread_count':
                if (data.payload?.count !== undefined) {
                  setUnreadCount(data.payload.count);
                }
                break;
                
              case 'notifications_marked_read':
                // Update read status for multiple notifications
                if (data.payload?.notificationIds) {
                  const { notificationIds } = data.payload;
                  setNotifications(prev => 
                    prev.map(notification => 
                      notificationIds.includes(notification.id) 
                        ? { ...notification, isRead: true } 
                        : notification
                    )
                  );
                  setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
                }
                break;
                
              case 'pong':
                // Silent pong response - no need to do anything
                break;
                
              case 'error':
                console.error('WebSocket error message:', data.payload?.message);
                toast({
                  title: 'Error',
                  description: data.payload?.message || 'An error occurred',
                  variant: 'destructive',
                  duration: 3000,
                });
                break;
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error instanceof Error ? error.message : 'Unknown parsing error');
          }
        };
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
        setConnectionStatus('disconnected');
      }
    };

    // Set up WebSocket with proper connection handling
    setupWebSocket();
    
    // Handle visibility change to reconnect if needed when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          user && 
          user.id && 
          (!wsRef.current || wsRef.current.readyState !== 1)) { // 1 = OPEN
        setupWebSocket();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      console.log('Cleaning up notification WebSocket connection');
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user?.id]); // Only reconnect if user ID changes, not on every user object change

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
      if (wsRef.current && wsRef.current.readyState === 1) { // 1 = OPEN
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
      if (wsRef.current && wsRef.current.readyState === 1) { // 1 = OPEN
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