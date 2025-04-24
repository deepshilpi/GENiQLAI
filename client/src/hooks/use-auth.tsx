import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type LoginCredentials = {
  username: string;
  password: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginCredentials>;
  logoutMutation: UseMutationResult<any, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
  updatePlanMutation: UseMutationResult<User, Error, { planType: string }>;
  updateProfilePicture: UseMutationResult<User, Error, FormData>;
  refetchUser: () => Promise<User | null>; // Add direct refetch method
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  
  // Local state to track manual log state to force re-renders
  const [forceAuthUpdate, setForceAuthUpdate] = useState(0);

  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user", forceAuthUpdate], // Include forceAuthUpdate in query key
    queryFn: async (context) => {
      console.log("[Auth] Fetching user data with queryKey:", context.queryKey);
      
      // In Replit environment, we'll just make the request regardless of cookie presence
      // This is more reliable in iframe environments where cookie detection can be unreliable
      try {
        // Add a cache-busting timestamp to the URL
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/user?_t=${timestamp}`, {
          credentials: 'include', // Always include credentials
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log("[Auth] User not authenticated (401)");
            return null;
          }
          throw new Error(`User fetch failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log("[Auth] User fetch successful:", result.username);
        return result as User;
      } catch (err) {
        console.error("[Auth] Error fetching user:", err);
        return null;
      }
    },
    // Override the default queryClient settings for this specific query
    staleTime: 0, // Set to 0 to allow refetching when needed
    retry: 1, // Try once more on failure
    refetchOnWindowFocus: true, // Enable refetching on window focus for better state sync
    refetchOnMount: true, // Refetch when component mounts to ensure fresh data
  });

  // Expose refetch method for use elsewhere
  const refetchUser = async (): Promise<User | null> => {
    setForceAuthUpdate(prev => prev + 1); // Force a refetch by updating the state
    try {
      const result = await refetch();
      return result.data as User | null;
    } catch (err) {
      console.error("[Auth] Error in refetchUser:", err);
      return null;
    }
  };

  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      try {
        // Before even attempting to log in, set a temporary loading state
        // This helps UI elements update immediately while the request is processing
        queryClient.cancelQueries({ queryKey: ["/api/user"] });
        
        // Add a special timestamp to prevent caching
        // Use fetch directly instead of apiRequest for more reliable session handling
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/login?_t=${timestamp}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          credentials: 'include', // Important: include cookies for session
          body: JSON.stringify(credentials)
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Login failed with status ${res.status}`);
        }
        
        const userData = await res.json();
        return userData;
      } catch (err: any) {
        console.error("Login API error:", err);
        throw new Error(err.message || "Login failed");
      }
    },
    onMutate: async (credentials) => {
      // Optimistically show loading state
      console.log("Login attempt started for:", credentials.username);
      
      // Cancel any ongoing queries
      await queryClient.cancelQueries({ queryKey: ["/api/user"] });
      
      // Force a refresh of the auth state immediately 
      setForceAuthUpdate(prev => prev + 1);
    },
    onSuccess: (userData) => {
      console.log("Login successful, setting user data:", userData);
      
      // The most important part: Aggressively update the cache with multiple methods
      // 1. Direct cache update
      queryClient.setQueryData(["/api/user", forceAuthUpdate], userData);
      queryClient.setQueryData(["/api/user"], userData);
      
      // 2. Force multiple rerenders of the auth context
      setForceAuthUpdate(prev => prev + 10); // Make a bigger jump to ensure state change
      
      // 3. Reset the entire cache for auth-related queries
      queryClient.resetQueries({ queryKey: ["/api/user"] });
      
      // 4. Invalidate all auth-dependent queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
          return [
            "/api/saved-ideas", 
            "/api/analyses", 
            "/api/posts",
            "/api/notifications",
            "/api/user"
          ].some(key => String(queryKey).includes(key));
        }
      });
      
      // 5. Force multiple refetches with increasing delays
      const refetchDelays = [100, 500, 1000, 2000];
      refetchDelays.forEach(delay => {
        setTimeout(() => {
          console.log(`Refetching user data after ${delay}ms`);
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          // Also directly call refetch
          refetch();
        }, delay);
      });
      
      // 6. In case this is a production environment, also force a page data refetch
      if (window.location.hostname.includes('.com') || 
          window.location.hostname.includes('.org') || 
          window.location.hostname.includes('.app')) {
        console.log("Production environment detected, applying aggressive refresh strategy");
        // Force a window reload in 500ms to make sure the browser knows we're logged in
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      
      // Close any auth dialogs and redirect
      if (location !== "/") {
        navigate("/");
      }
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      
      // Force refresh of auth state on error too
      setForceAuthUpdate(prev => prev + 1);
      
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<User, Error, InsertUser>({
    mutationFn: async (credentials) => {
      try {
        // Use fetch directly instead of apiRequest for more reliable session handling
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/register?_t=${timestamp}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          credentials: 'include', // Important: include cookies for session
          body: JSON.stringify(credentials)
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Registration failed with status ${res.status}`);
        }
        
        const userData = await res.json();
        return userData;
      } catch (err: any) {
        console.error("Registration API error:", err);
        throw new Error(err.message || "Registration failed");
      }
    },
    onMutate: async () => {
      // Cancel any ongoing queries
      await queryClient.cancelQueries({ queryKey: ["/api/user"] });
      
      // Force a refresh of the auth state immediately
      setForceAuthUpdate(prev => prev + 1);
    },
    onSuccess: (userData) => {
      console.log("Registration successful, setting user data:", userData);
      
      // The most important part: Aggressively update the cache with multiple methods
      // 1. Direct cache update
      queryClient.setQueryData(["/api/user", forceAuthUpdate], userData);
      queryClient.setQueryData(["/api/user"], userData);
      
      // 2. Force multiple rerenders of the auth context
      setForceAuthUpdate(prev => prev + 10); // Make a bigger jump to ensure state change
      
      // 3. Reset the entire cache for auth-related queries
      queryClient.resetQueries({ queryKey: ["/api/user"] });
      
      // 4. Invalidate all auth-dependent queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
          return [
            "/api/saved-ideas", 
            "/api/analyses", 
            "/api/posts",
            "/api/notifications",
            "/api/user"
          ].some(key => String(queryKey).includes(key));
        }
      });
      
      // 5. Force multiple refetches with increasing delays
      const refetchDelays = [100, 500, 1000];
      refetchDelays.forEach(delay => {
        setTimeout(() => {
          console.log(`Refetching user data after ${delay}ms`);
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          // Also directly call refetch
          refetch();
        }, delay);
      });
      
      // 6. In case this is a production environment, also force a page data refetch
      if (window.location.hostname.includes('.com') || 
          window.location.hostname.includes('.org') || 
          window.location.hostname.includes('.app')) {
        console.log("Production environment detected, applying aggressive refresh strategy");
        // Force a window reload in 500ms to make sure the browser knows we're logged in
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        // In development, just navigate
        if (location !== "/") {
          navigate("/");
        }
      }
      
      toast({
        title: "Registration successful",
        description: `Welcome to GENIQL, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<any, Error, void>({
    mutationFn: async () => {
      try {
        // Before attempting logout, cancel current user queries
        queryClient.cancelQueries({ queryKey: ["/api/user"] });
        
        // Send logout request with a timestamp to avoid caching
        // Use fetch directly instead of apiRequest for more reliable session handling
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/logout?_t=${timestamp}`, {
          method: 'POST',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          credentials: 'include' // Important: include cookies for session
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Logout failed with status ${res.status}`);
        }
        
        // After successful logout, clear any cookies by setting them to expired
        document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
        
        return true;
      } catch (err: any) {
        console.error("Logout API error:", err);
        throw new Error(err.message || "Logout failed");
      }
    },
    onMutate: async () => {
      // Optimistically update UI
      console.log("Logout attempt started");
      
      // Cancel any ongoing queries 
      await queryClient.cancelQueries({ queryKey: ["/api/user"] });
      
      // Save the previous user value
      const previousUser = queryClient.getQueryData<User | null>(["/api/user", forceAuthUpdate]);
      
      // Immediately set user to null to update UI elements
      queryClient.setQueryData(["/api/user", forceAuthUpdate], null);
      queryClient.setQueryData(["/api/user"], null);
      
      // Force a refresh of the auth state immediately
      setForceAuthUpdate(prev => prev + 1);
      
      // Return properly typed context
      return { previousUser: previousUser };
    },
    onSuccess: () => {
      console.log("Logout successful, clearing user data");
      
      // The most important part: Aggressively update the cache with multiple methods
      // 1. Direct cache update - set to null
      queryClient.setQueryData(["/api/user", forceAuthUpdate], null);
      queryClient.setQueryData(["/api/user"], null);
      
      // 2. Force multiple rerenders of the auth context
      setForceAuthUpdate(prev => prev + 10); // Make a bigger jump to ensure state change
      
      // 3. Reset the entire cache for auth-related queries
      queryClient.resetQueries({ queryKey: ["/api/user"] });
      
      // 4. Reset all auth-dependent queries to their initial state
      queryClient.resetQueries({ 
        predicate: (query) => {
          const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
          return [
            "/api/saved-ideas", 
            "/api/analyses", 
            "/api/posts",
            "/api/notifications",
            "/api/user"
          ].some(key => String(queryKey).includes(key));
        }
      });
      
      // 5. Force multiple refetches with increasing delays
      const refetchDelays = [100, 500, 1000];
      refetchDelays.forEach(delay => {
        setTimeout(() => {
          console.log(`Refetching user data after ${delay}ms`);
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          // Also directly call refetch
          refetch();
        }, delay);
      });
      
      // 6. In case this is a production environment, also force a page data refetch
      if (window.location.hostname.includes('.com') || 
          window.location.hostname.includes('.org') || 
          window.location.hostname.includes('.app')) {
        console.log("Production environment detected, applying aggressive refresh strategy");
        // Force a window reload in 500ms to make sure the browser knows we're logged out
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        // In development, just navigate
        navigate("/");
      }
      
      toast({
        title: "Logged out successfully",
      });
    },
    onError: (error: Error, variables: void, context: unknown) => {
      console.error("Logout error:", error);
      
      // Type-check and cast the context
      const typedContext = context as { previousUser: User | null } | undefined;
      
      // Restore previous user data if available
      if (typedContext?.previousUser) {
        queryClient.setQueryData(["/api/user", forceAuthUpdate], typedContext.previousUser);
      }
      
      // Force a refresh of auth state
      setForceAuthUpdate(prev => prev + 1);
      
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
      
      // Force refetch user data to ensure consistent state
      refetchUser();
    },
  });

  const updatePlanMutation = useMutation<User, Error, { planType: string }>({
    mutationFn: async ({ planType }) => {
      const res = await apiRequest("POST", "/api/user/plan", { planType });
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user", forceAuthUpdate], updatedUser);
      setForceAuthUpdate(prev => prev + 1);
      
      toast({
        title: "Subscription updated",
        description: `Your plan has been upgraded to ${updatedUser.planType}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfilePicture = useMutation<User, Error, FormData>({
    mutationFn: async (formData) => {
      const res = await fetch('/api/profile-picture', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to upload profile picture');
      }
      
      const responseData = await res.json();
      return responseData.user;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user", forceAuthUpdate], updatedUser);
      setForceAuthUpdate(prev => prev + 1);
      
      toast({
        title: "Profile updated",
        description: "Your profile picture has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Profile update failed",
        description: error.message || "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Effect to periodically check auth state in Replit environment
  useEffect(() => {
    // Skip if user is already loaded
    if (user) {
      console.log("[AuthProvider] User already loaded:", user.username);
      return;
    }
    
    // Replit-specific: Force check user state periodically
    const checkInterval = setInterval(() => {
      console.log("[AuthProvider] Scheduled auth check running");
      // Only run this check if we don't have a user yet
      if (!user) {
        // Hard fetch for auth state
        fetch('/api/user?_t=' + Date.now(), {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        .then(res => {
          if (res.ok) {
            return res.json();
          }
          return null;
        })
        .then(userData => {
          if (userData?.id) {
            console.log("[AuthProvider] Direct auth check found user:", userData.username);
            // Force update with this userData
            queryClient.setQueryData(["/api/user", forceAuthUpdate], userData);
            queryClient.setQueryData(["/api/user"], userData);
            setForceAuthUpdate(prev => prev + 1);
            
            // Also explicitly refetch via React Query
            refetch();
          }
        })
        .catch(err => {
          console.error("[AuthProvider] Direct auth check error:", err);
        });
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(checkInterval);
  }, [user, forceAuthUpdate]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updatePlanMutation,
        updateProfilePicture,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}