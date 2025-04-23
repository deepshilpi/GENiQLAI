import { create } from 'zustand';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export type NotificationType = 'comment' | 'analysis' | 'follower' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  createdAt: Date;
  read: boolean;
  actionUrl?: string;
  iconClassName?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  exportNotifications: () => string;
}

// Create a store using Zustand for global notification state
export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notification) => set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      read: false,
    };
    
    // Add notification and update unread count
    return {
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    };
  }),
  
  markAsRead: (id) => set((state) => {
    const updatedNotifications = state.notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    
    return { notifications: updatedNotifications, unreadCount };
  }),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(notification => ({ ...notification, read: true })),
    unreadCount: 0,
  })),
  
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
  
  exportNotifications: () => {
    let state: NotificationState;
    useNotificationStore.subscribe(s => { state = s; })();
    
    const notificationsData = state!.notifications.map(notification => ({
      type: notification.type,
      title: notification.title,
      content: notification.content,
      date: notification.createdAt.toLocaleDateString(),
      time: notification.createdAt.toLocaleTimeString(),
      read: notification.read ? 'Yes' : 'No'
    }));
    
    return JSON.stringify(notificationsData, null, 2);
  }
}));

// Custom hook to use the notification store with optional auto-loading
export function useNotifications() {
  const store = useNotificationStore();
  const { user } = useAuth();
  
  // Demo initialization - replace with actual API fetch in production
  useEffect(() => {
    if (user && store.notifications.length === 0) {
      // Initialize with demo notifications when user logs in
      store.addNotification({
        type: 'comment',
        title: 'New community comment',
        content: 'Someone replied to your post about AI startups',
        iconClassName: 'bg-vision-primary-gradient/20 text-vision-purple-700',
      });
      
      store.addNotification({
        type: 'analysis',
        title: 'Analysis complete',
        content: 'Your startup idea analysis is ready to view',
        actionUrl: '/',
        iconClassName: 'bg-green-500/20 text-green-500',
      });
      
      store.addNotification({
        type: 'follower',
        title: 'New follower',
        content: 'A new user is now following you',
        actionUrl: '/profile',
        iconClassName: 'bg-blue-500/20 text-blue-500',
      });
    }
  }, [user]);
  
  return store;
}

// Function to format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
}

// Helper to download notifications as JSON file
export function downloadNotifications() {
  const store = useNotificationStore.getState();
  const data = store.exportNotifications();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `geniql-notifications-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}