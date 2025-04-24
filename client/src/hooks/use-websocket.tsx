import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import webSocketService, { 
  WebSocketMessage, 
  WebSocketStatus, 
  WebSocketEventCallback 
} from '@/lib/websocket-service';

export function useWebSocket() {
  const { user } = useAuth();
  const [status, setStatus] = useState<WebSocketStatus>(webSocketService.getStatus());
  
  // Initialize WebSocket service when user is authenticated
  useEffect(() => {
    if (user && user.id) {
      // Initialize the WebSocket service with the user ID
      webSocketService.init(user.id);
      
      // Subscribe to all messages to update status
      const statusCallback = () => {
        setStatus(webSocketService.getStatus());
      };
      
      webSocketService.subscribe('auth_success', statusCallback);
      webSocketService.subscribe('error', statusCallback);
      
      // Update initial status
      setStatus(webSocketService.getStatus());
      
      // Clean up
      return () => {
        webSocketService.unsubscribe('auth_success', statusCallback);
        webSocketService.unsubscribe('error', statusCallback);
      };
    } else {
      // Clean up if user logs out
      webSocketService.destroy();
      setStatus('disconnected');
    }
  }, [user?.id]);
  
  // Send a message through the WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    webSocketService.send(message);
  }, []);
  
  // Subscribe to WebSocket events
  const subscribe = useCallback((eventType: string, callback: WebSocketEventCallback) => {
    webSocketService.subscribe(eventType, callback);
    
    // Return unsubscribe function
    return () => {
      webSocketService.unsubscribe(eventType, callback);
    };
  }, []);
  
  return {
    status,
    sendMessage,
    subscribe,
    isConnected: webSocketService.isConnected()
  };
}

export default useWebSocket;