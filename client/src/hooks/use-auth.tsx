import { createContext, ReactNode, useContext, useEffect } from "react";
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
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
  updatePlanMutation: UseMutationResult<User, Error, { planType: string }>;
  updateProfilePicture: UseMutationResult<User, Error, FormData>;
  refetchUser: () => Promise<User | null>; // Add direct refetch method
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // Force immediate validation and smaller stale time for auth data
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: (failureCount, error: any) => {
      // Only retry network errors, not auth errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2; // Maximum 2 retries
    },
    staleTime: 10000, // 10 seconds - keep user data fresh
    refetchOnWindowFocus: true, // Refetch when window focuses to ensure auth state is current
    // Add error handler to prevent crashing the entire app on auth failure
    onError: (error) => {
      console.error("[Auth] Failed to fetch user data:", error);
      // Don't show toast on auth page to avoid duplicate error messages
      if (!location.startsWith("/auth")) {
        toast({
          title: "Authentication Error",
          description: "Please try refreshing the page or logging in again.",
          variant: "destructive",
        });
      }
    },
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

  // Clean up any stale auth flags when the provider mounts
  useEffect(() => {
    const cleanupOldAuthFlags = () => {
      // Clear any stale auth flags
      if (sessionStorage.getItem('auth_login_success')) {
        console.log("[Auth] Cleaning up stale login success flag");
        sessionStorage.removeItem('auth_login_success');
      }
      
      if (sessionStorage.getItem('auth_logout_requested')) {
        console.log("[Auth] Cleaning up stale logout requested flag");
        sessionStorage.removeItem('auth_logout_requested');
      }
    };
    
    cleanupOldAuthFlags();
  }, []);

  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (userData) => {
      // Update the auth data in cache immediately
      queryClient.setQueryData(["/api/user"], userData);
      
      // Invalidate the query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Redirect to home page
      navigate("/");
      
      // Show success message
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.username}!`,
      });
      
      // Force refresh other dependent queries
      queryClient.invalidateQueries();
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
      // Update the auth data in cache immediately
      queryClient.setQueryData(["/api/user"], userData);
      
      // Invalidate the query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Redirect to home page
      navigate("/");
      
      // Show success message
      toast({
        title: "Registration successful",
        description: `Welcome to GENIQL, ${userData.username}!`,
      });
      
      // Force refresh other dependent queries
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Completely rewritten logout mutation for more reliable behavior
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      // Set flag that logout is in progress - will be checked by queryClient
      sessionStorage.setItem('auth_logout_requested', 'true');
      
      try {
        // This may succeed or fail, but UI will update regardless
        await apiRequest("POST", "/api/logout");
      } catch (error) {
        console.error("Logout API error:", error);
        // Even if API call fails, proceed with client-side logout
      }
    },
    onMutate: async () => {
      console.log("[Auth] Logout mutation started");
      
      // Cancel any in-flight queries
      await queryClient.cancelQueries();
      
      // Clear user data from cache immediately for faster UI response
      queryClient.setQueryData(["/api/user"], null);
      
      // Clear any session cookies from browser storage (just in case)
      document.cookie = "connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      
      return { previousUser: null };
    },
    onSuccess: () => {
      console.log("[Auth] Logout API call succeeded");
      
      // Double-check user data is cleared from cache
      queryClient.setQueryData(["/api/user"], null);
      
      // Reset query cache completely
      queryClient.clear();
      
      // Show success toast
      toast({
        title: "Logged out successfully",
        description: "You have been securely logged out",
      });
      
      // Force browser to auth page (unless a callback function overrides)
      if (location !== "/auth") {
        // Use timeout to ensure UI updates first
        setTimeout(() => {
          navigate("/auth");
        }, 100);
      }
    },
    onError: (error) => {
      console.error("Logout API error (handled):", error);
      
      // Even on error, we want to clear the UI state
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      
      // Show error toast but with user-friendly message
      toast({
        title: "Logged out",
        description: "You've been logged out, but there was a server error.",
        variant: "destructive",
      });
      
      // Force browser to auth page
      if (location !== "/auth") {
        // Use timeout to ensure UI updates first
        setTimeout(() => {
          navigate("/auth");
        }, 100);
      }
    },
    onSettled: () => {
      console.log("[Auth] Logout completed (success or error)");
      
      // Final cleanup
      queryClient.removeQueries({ queryKey: ["/api/user"] });
      sessionStorage.removeItem('auth_login_success');
      sessionStorage.removeItem('auth_logout_requested');
      
      // If we're still not on auth page, force it
      if (location !== "/auth") {
        window.location.href = "/auth";
      }
    },
  });

  const updatePlanMutation = useMutation<User, Error, { planType: string }>({
    mutationFn: async ({ planType }) => {
      const res = await apiRequest("POST", "/api/user/plan", { planType });
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      
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