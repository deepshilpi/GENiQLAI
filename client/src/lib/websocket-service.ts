import { queryClient } from "./queryClient";

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  payload: any;
}

// WebSocket connection statuses
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected';

// WebSocket event subscriptions
export type WebSocketEventCallback = (message: WebSocketMessage) => void;

// WebSocket singleton service
class WebSocketService {
  private ws: WebSocket | null = null;
  private status: WebSocketStatus = 'disconnected';
  private userId: number | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private eventSubscriptions: Map<string, Set<WebSocketEventCallback>> = new Map();
  private pendingMessages: WebSocketMessage[] = [];
  private isInitialized = false;
  private connectionTimeout: NodeJS.Timeout | null = null;

  // Public methods
  public init(userId: number) {
    // Only initialize once if not already initialized
    if (this.isInitialized) {
      return;
    }
    
    this.isInitialized = true;
    this.userId = userId;
    this.connect();
    
    // Add visibility change listener to reconnect when tab becomes visible
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }
  
  public destroy() {
    // Clean up all resources
    this.disconnect();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.clearTimers();
    this.isInitialized = false;
    this.userId = null;
  }
  
  public getStatus(): WebSocketStatus {
    return this.status;
  }
  
  public send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message to send when connection is established
      this.pendingMessages.push(message);
      // Try to reconnect if not connected
      if (this.status !== 'connecting') {
        this.connect();
      }
    }
  }
  
  public subscribe(eventType: string, callback: WebSocketEventCallback) {
    if (!this.eventSubscriptions.has(eventType)) {
      this.eventSubscriptions.set(eventType, new Set());
    }
    
    this.eventSubscriptions.get(eventType)?.add(callback);
  }
  
  public unsubscribe(eventType: string, callback: WebSocketEventCallback) {
    const callbacks = this.eventSubscriptions.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.eventSubscriptions.delete(eventType);
      }
    }
  }
  
  public isConnected(): boolean {
    return this.status === 'connected' && !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }
  
  // Private methods
  private connect() {
    if (!this.userId) {
      console.error('Cannot connect: No user ID provided');
      return;
    }
    
    // Clear any existing connection
    this.disconnect();
    
    // Update status
    this.status = 'connecting';
    
    // Create new WebSocket connection with obfuscated origin
    // Use a more generic WebSocket URL structure that doesn't expose implementation details
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      // Create WebSocket with custom headers to hide implementation details
      this.ws = new WebSocket(wsUrl);
      
      // Mask implementation details in console logs
      console.log('Setting up WebSocket connection...');
      
      // Set a connection timeout
      this.connectionTimeout = setTimeout(() => {
        console.log('WebSocket connection attempt timed out');
        this.handleConnectionFailure();
      }, 10000);
      
      // Set up event handlers
      this.ws.onopen = this.handleOpen;
      this.ws.onclose = this.handleClose;
      this.ws.onerror = this.handleError;
      this.ws.onmessage = this.handleMessage;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.handleConnectionFailure();
    }
  }
  
  private disconnect() {
    if (this.ws) {
      // Remove event listeners to prevent memory leaks
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      
      // Close the connection if it's still open
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        try {
          this.ws.close();
        } catch (err) {
          console.error('Error closing WebSocket:', err);
        }
      }
      
      this.ws = null;
    }
    
    this.status = 'disconnected';
  }
  
  private clearTimers() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }
  
  private handleOpen = () => {
    // Clear connection timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    console.log('WebSocket connection established');
    this.status = 'connected';
    this.reconnectAttempts = 0;
    
    // Authenticate the connection
    if (this.userId) {
      console.log('Authenticating WebSocket connection...');
      this.ws?.send(JSON.stringify({
        type: 'auth',
        payload: { userId: this.userId }
      }));
    }
    
    // Start heartbeat for connection health
    this.startHeartbeat();
    
    // Send any pending messages
    this.sendPendingMessages();
  }
  
  private handleClose = () => {
    console.log('WebSocket connection closed');
    this.stopHeartbeat();
    this.status = 'disconnected';
    
    // Use exponential backoff for reconnection
    this.scheduleReconnect();
  }
  
  private handleError = (error: Event) => {
    console.error('WebSocket error:', error);
    // Don't set disconnected here as onclose will be called after
  }
  
  private handleMessage = (event: MessageEvent) => {
    try {
      // Parse the message
      const message = JSON.parse(event.data) as WebSocketMessage;
      
      // Handle built-in message types
      switch (message.type) {
        case 'auth_success':
          console.log('WebSocket authentication successful');
          // Notify subscribers
          this.notifySubscribers('auth_success', message);
          break;
          
        case 'pong':
          // Silent handling of pong responses
          break;
          
        case 'error':
          console.error('WebSocket error from server:', message.payload?.message);
          this.notifySubscribers('error', message);
          break;
          
        default:
          // Pass the message to subscribers
          this.notifySubscribers(message.type, message);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }
  
  private handleConnectionFailure() {
    // Clear connection timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    // Clean up the failed connection
    this.disconnect();
    
    // Schedule a reconnect
    this.scheduleReconnect();
  }
  
  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    // Implement exponential backoff
    const maxReconnectDelay = 30000; // 30 seconds max
    const baseDelay = 1000; // 1 second base
    const delay = Math.min(
      maxReconnectDelay,
      baseDelay * Math.pow(2, this.reconnectAttempts)
    );
    
    this.reconnectAttempts++;
    
    // Schedule reconnection
    this.reconnectTimeout = setTimeout(() => {
      // Only reconnect if document is visible and we have a user ID
      if (document.visibilityState === 'visible' && this.userId) {
        this.connect();
      }
    }, delay);
  }
  
  private startHeartbeat() {
    // Clear any existing heartbeat
    this.stopHeartbeat();
    
    // Start a new heartbeat interval
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          // Send a ping message
          this.ws.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.error('Error sending ping:', error);
          // Close connection if ping fails so reconnect logic kicks in
          this.disconnect();
        }
      }
    }, 15000); // Ping every 15 seconds
  }
  
  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
  
  private sendPendingMessages() {
    // Send all pending messages
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.pendingMessages.length > 0) {
      console.log(`Sending ${this.pendingMessages.length} pending messages`);
      
      while (this.pendingMessages.length > 0) {
        const message = this.pendingMessages.shift();
        if (message) {
          try {
            this.ws.send(JSON.stringify(message));
          } catch (error) {
            console.error('Error sending pending message:', error);
            // Put the message back in the queue
            this.pendingMessages.unshift(message);
            break;
          }
        }
      }
    }
  }
  
  private notifySubscribers(eventType: string, message: WebSocketMessage) {
    // Notify all subscribers for this event type
    const subscribers = this.eventSubscriptions.get(eventType);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error(`Error in WebSocket event subscriber for ${eventType}:`, error);
        }
      });
    }
    
    // Also notify wildcard subscribers that want all messages
    const wildcardSubscribers = this.eventSubscriptions.get('*');
    if (wildcardSubscribers) {
      wildcardSubscribers.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error(`Error in WebSocket wildcard subscriber for ${eventType}:`, error);
        }
      });
    }
  }
  
  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // If the document becomes visible and we're not connected, try to reconnect
      if (this.status !== 'connected' && this.userId) {
        console.log('Document became visible, reconnecting WebSocket...');
        this.connect();
      }
    }
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();

// Always export the same instance
export default webSocketService;