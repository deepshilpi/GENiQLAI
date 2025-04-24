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
  
  // Add timestamp to avoid browser caching
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  
  // Track auth check status
  const [authChecked, setAuthChecked] = useState(false);
  
  // Check if we're in a production environment - move this outside component to avoid hooks issues
  // This should be a plain variable, not derived from hooks
  const isProduction = typeof window !== 'undefined' && (
      window.location.hostname.includes('.replit.app') || 
      window.location.hostname.includes('.com') || 
      window.location.hostname.includes('.org') || 
      window.location.hostname.includes('.app')
  );
      
  // Production-specific login handler to fix auth state issues in deployed environment
  const handleProductionLogin = (userData: User) => {
    if (!isProduction) return false;
    
    console.log("[Auth] Production environment detected, applying specialized login handler");
    
    // Store login state in localStorage as a backup mechanism
    try {
      localStorage.setItem('geniql_auth_user', JSON.stringify({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        timestamp: Date.now()
      }));
      console.log("[Auth] User data saved in localStorage as fallback");
    } catch (err) {
      console.error("[Auth] Failed to store auth data in localStorage:", err);
    }
    
    // Set a flag in sessionStorage to indicate we're coming from a login
    try {
      sessionStorage.setItem('auth_just_logged_in', 'true');
      sessionStorage.setItem('auth_username', userData.username);
      console.log("[Auth] Login state flags set in sessionStorage");
    } catch (err) {
      console.error("[Auth] Failed to store auth data in sessionStorage:", err); 
    }
    
    // Show toast immediately so user gets immediate feedback
    toast({
      title: "Login successful",
      description: `Welcome back, ${userData.username}! Please wait while we redirect you...`,
    });
    
    // Force a home page redirect with clean state
    console.log("[Auth] Forcing page navigation for production environment");
    setTimeout(() => {
      window.location.href = '/';
    }, 800);
    
    return true; // Return true to indicate we've handled the login
  };
  
  // Direct login helper function - used for critical auth operations
  const directLogin = async (credentials: LoginCredentials): Promise<User | null> => {
    try {
      console.log("[Auth] Attempting direct login for:", credentials.username);
      const timestamp = Date.now();
      setLastRefreshTime(timestamp);
      
      // Make the login request
      const response = await fetch(`/api/login?_t=${timestamp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        console.error("[Auth] Direct login failed:", response.status);
        return null;
      }
      
      // Parse the response
      const userData = await response.json();
      console.log("[Auth] Direct login successful:", userData.username);
      
      // Directly set the cache data
      queryClient.setQueryData(["/api/user"], userData);
      queryClient.setQueryData(["/api/user", forceAuthUpdate], userData);
      
      // Force a refresh to ensure all components update
      setForceAuthUpdate(prev => prev + 5);
      
      return userData;
    } catch (error) {
      console.error("[Auth] Direct login error:", error);
      return null;
    }
  };

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
      
      // Check if we need to handle this as a production environment login
      // This will return true if production handling was applied 
      if (handleProductionLogin(userData)) {
        // If production login was handled, skip the rest of this function
        return;
      }
      
      // For non-production environments, continue with standard login flow:
      
      // 1. Direct cache update - single operation to prevent multiple renders
      queryClient.setQueryData(["/api/user"], userData);
      
      // 2. Set a timestamp for the auth update to force a single state change
      setForceAuthUpdate(Date.now());
      
      // 3. Reset auth-dependent queries once
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
      
      // 4. Perform a single refetch after a short delay to ensure state is stabilized
      setTimeout(() => {
        console.log("Refetching user data to confirm auth state");
        refetch();
      }, 300);
      
      // For development environment, regular navigation is fine
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
      
      // Check if we need to handle this as a production environment login
      // This will return true if production handling was applied 
      if (handleProductionLogin(userData)) {
        // Show a more engaging welcome toast for new users
        toast({
          title: "Registration successful",
          description: `Welcome to GENIQL, ${userData.username}! Setting up your account...`,
        });
        // If production login was handled, skip the rest of this function
        return;
      }
      
      // For non-production environments, continue with standard login flow:
      
      // 1. Direct cache update - single operation to prevent multiple renders
      queryClient.setQueryData(["/api/user"], userData);
      
      // 2. Set a timestamp for the auth update to force a single state change
      setForceAuthUpdate(Date.now());
      
      // 3. Reset auth-dependent queries once
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
      
      // 4. Perform a single refetch after a short delay to ensure state is stabilized
      setTimeout(() => {
        console.log("Refetching user data to confirm auth state");
        refetch();
      }, 300);
      
      // For development environment, regular navigation is fine
      if (location !== "/") {
        navigate("/");
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
      
      // Clear any localStorage backup auth data
      try {
        localStorage.removeItem('geniql_auth_user');
        sessionStorage.removeItem('auth_just_logged_in');
        sessionStorage.removeItem('auth_username');
        console.log("[Auth] Cleared auth data from local/session storage");
      } catch (err) {
        console.error("[Auth] Failed to clear storage auth data:", err);
      }
      
      // Update the cache efficiently
      // 1. Direct cache update - set to null
      queryClient.setQueryData(["/api/user"], null);
      
      // 2. Use a timestamp for forceAuthUpdate to ensure a single state change
      setForceAuthUpdate(Date.now());
      
      // 3. Reset auth-related queries in one operation
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
      
      // 4. Perform a single refetch after a short delay to confirm logout state
      setTimeout(() => {
        console.log("Confirming logout state");
        refetch();
      }, 300);
      
      // For production environment, we need special handling
      if (isProduction) {
        // Show toast immediately so user gets immediate feedback
        toast({
          title: "Logged out successfully",
          description: "Redirecting to home page...",
        });
        
        // Force a home page redirect with clean state
        console.log("[Auth] Forcing page navigation for production environment");
        setTimeout(() => {
          window.location.href = '/';
        }, 800);
        
        return; // Skip the rest of the function
      } else {
        // In development, just navigate
        navigate("/");
        
        toast({
          title: "Logged out successfully",
        });
      }
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
      queryClient.setQueryData(["/api/user"], updatedUser);
      setForceAuthUpdate(Date.now());
      
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
      queryClient.setQueryData(["/api/user"], updatedUser);
      setForceAuthUpdate(Date.now());
      
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
  
  // Effect to perform an initial auth check on mount
  useEffect(() => {
    console.log("[AuthProvider] Initial auth check on mount");
    
    // Set a flag to ensure we only run this once
    if (!authChecked) {
      setAuthChecked(true);
      
      // First, check if there's a temporary user in sessionStorage from a login redirect
      const sessionUsername = sessionStorage.getItem('auth_username');
      const justLoggedIn = sessionStorage.getItem('auth_just_logged_in');
      
      if (isProduction && justLoggedIn && sessionUsername) {
        console.log("[AuthProvider] Found login redirect state in sessionStorage:", sessionUsername);
        
        // We'll keep the session data for now, it will be cleared in App.tsx post-reload
        console.log("[AuthProvider] Login redirect detected, applying controlled cache fetch");
        
        // Use a limited number of fetch attempts with proper error handling
        let fetchAttempts = 0;
        const maxAttempts = 3;
        const attemptFetch = () => {
          fetchAttempts++;
          refetchUser()
            .then(userData => {
              if (userData) {
                console.log(`[AuthProvider] Auth check attempt ${fetchAttempts} successful, user:`, userData.username);
              } else if (fetchAttempts < maxAttempts) {
                setTimeout(attemptFetch, 300 * fetchAttempts); // Increasing delays between attempts
              }
            })
            .catch(err => {
              console.error(`[AuthProvider] Auth check attempt ${fetchAttempts} failed:`, err);
              if (fetchAttempts < maxAttempts) {
                setTimeout(attemptFetch, 300 * fetchAttempts);
              }
            });
        };
        
        // Start the first attempt
        attemptFetch();
      } else {
        // For regular sessions, just do a single refetch
        refetchUser().catch(err => {
          console.error("[AuthProvider] Initial auth check failed:", err);
        });
      }
      
      // Check localStorage for backup auth data
      try {
        const storedUserData = localStorage.getItem('geniql_auth_user');
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          const timestamp = parsedData.timestamp || 0;
          const nowTime = Date.now();
          const isRecent = (nowTime - timestamp) < 24 * 60 * 60 * 1000; // 24 hours
          
          if (isRecent) {
            console.log("[AuthProvider] Found backup auth data in localStorage:", parsedData.username);
          } else {
            console.log("[AuthProvider] Found expired backup auth data, clearing");
            localStorage.removeItem('geniql_auth_user');
          }
        }
      } catch (err) {
        console.error("[AuthProvider] Error checking localStorage:", err);
      }
      
      // Force an immediate auth check
      refetchUser().then(userData => {
        if (userData) {
          console.log("[AuthProvider] Initial auth check successful, user:", userData.username);
        } else {
          console.log("[AuthProvider] Initial auth check - no user found");
        }
      });
    }
  }, [isProduction, authChecked, refetchUser]);
  
  // Optimized effect to handle periodic auth state check when needed
  // This effect should only run for a limited time and with strict limits
  useEffect(() => {
    // Skip if user is already loaded - this is the most important optimization
    if (user) {
      // User is already loaded, no need for additional checks
      return;
    }
    
    // Use a reference to track attempts across renders
    const checkAttempts = { count: 0 };
    const maxAttempts = 2; // Reduced to 2 attempts maximum
    
    // Using a shorter interval but fewer attempts overall
    const checkInterval = setInterval(() => {
      // Only continue if we still don't have a user and haven't reached max attempts
      if (!user && checkAttempts.count < maxAttempts) {
        checkAttempts.count++;
        
        // Use a Promise wrapper with proper error handling to avoid unhandled rejections
        const safeAuthCheck = async () => {
          try {
            // Use fetch with proper error handling
            const res = await fetch('/api/user?_t=' + Date.now(), {
              credentials: 'include',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
            
            // Handle non-200 responses gracefully
            if (!res.ok) {
              if (res.status === 401) {
                // This is expected for unauthenticated users, no need to log it
                return null;
              }
              throw new Error(`Auth check failed with status ${res.status}`);
            }
            
            // Parse the JSON response
            const userData = await res.json();
            
            if (userData?.id) {
              // User found - update the cache with a single update
              queryClient.setQueryData(["/api/user"], userData);
              
              // Use timestamp for forceAuthUpdate to avoid multiple increments
              setForceAuthUpdate(Date.now());
              
              // Clear interval since we've found a user
              clearInterval(checkInterval);
            }
            
            return userData;
          } catch (error) {
            // Silence the error but stop trying if we've reached max attempts
            if (checkAttempts.count >= maxAttempts) {
              clearInterval(checkInterval);
            }
            return null;
          }
        };
        
        // Execute the auth check without awaiting (to avoid unhandled promise)
        safeAuthCheck();
      } else {
        // We've either found a user or reached maximum attempts
        clearInterval(checkInterval);
      }
    }, 15000); // Longer interval (15 seconds) to reduce server load
    
    // Cleanup the interval when the component unmounts
    return () => clearInterval(checkInterval);
  }, [user, setForceAuthUpdate]);

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