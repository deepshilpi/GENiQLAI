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
    queryKey: ["/api/user"],
    // Use a proper query function that handles auth errors correctly
    queryFn: async () => {
      try {
        const res = await fetch('/api/user', {
          credentials: 'include'
        });
        
        // Handle 401 by returning null (user not logged in)
        if (res.status === 401) {
          return null;
        }
        
        // For other errors, throw
        if (!res.ok) {
          throw new Error(`Authentication error: ${res.statusText}`);
        }
        
        // Return the user data
        return await res.json();
      } catch (error) {
        // Just return null on any error - we'll handle this as "not logged in"
        return null;
      }
    },
    // Simple settings that work well
    staleTime: 60000, // 1 minute
    retry: false,     // Don't retry auth failures
    refetchOnWindowFocus: true
  });

  // Simple refetch method that just calls the query's refetch
  const refetchUser = async (): Promise<User | null> => {
    try {
      const result = await refetch();
      return result.data as User | null;
    } catch {
      return null;
    }
  };

  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (userData) => {
      // Update the auth data in cache
      queryClient.setQueryData(["/api/user"], userData);
      
      // Redirect to home page
      navigate("/");
      
      // Show success message
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<User, Error, InsertUser>({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (userData) => {
      // Update the auth data in cache
      queryClient.setQueryData(["/api/user"], userData);
      
      // Redirect to home page
      navigate("/");
      
      // Show success message
      toast({
        title: "Registration successful",
        description: `Welcome to GENIQL, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Clear user data in cache
      queryClient.setQueryData(["/api/user"], null);
      
      // Redirect to login page
      navigate("/auth");
      
      // Show success message
      toast({
        title: "Logged out successfully",
      });
    },
    onError: () => {
      // Even if the server call fails, we'll clear the user from the client
      queryClient.setQueryData(["/api/user"], null);
      navigate("/auth");
      
      toast({
        title: "Logout issue",
        description: "You've been logged out but there was a server error.",
        variant: "destructive",
      });
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