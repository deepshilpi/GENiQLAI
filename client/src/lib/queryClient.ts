import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText = res.statusText;
    try {
      // Try to parse the error as JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorBody = await res.json();
        errorText = errorBody.message || JSON.stringify(errorBody);
      } else {
        errorText = await res.text() || res.statusText;
      }
    } catch (e) {
      // Don't re-throw or log this error as it's already being handled
      errorText = res.statusText || "Unknown error";
    }
    
    // Create an error with additional properties for better debugging
    const error: any = new Error(errorText);
    error.status = res.status;
    error.statusText = res.statusText;
    error.url = res.url;
    
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Add timestamp to auth-related endpoints to prevent caching
  const isAuthRelated = url.includes("/api/login") || url.includes("/api/logout") || url.includes("/api/user") || url.includes("/api/register");
  const finalUrl = isAuthRelated
    ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`
    : url;

  // For logout, we need to add a special flag to handle post-logout UI updates
  if (url.includes("/api/logout")) {
    console.log("[Auth] Logout requested - preparing cache invalidation");
    // This will be checked before the actual logout request is made
    sessionStorage.setItem('auth_logout_requested', 'true');
  }
    
  try {
    const res = await fetch(finalUrl, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        // Add cache control headers for all auth-related requests
        ...(isAuthRelated 
          ? {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            } 
          : {})
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // For login success, ensure we add a marker for post-login behavior
    if ((url.includes("/api/login") || url.includes("/api/register")) && res.ok) {
      console.log("[Auth] Login/register successful - flagging for UI refresh");
      sessionStorage.setItem('auth_login_success', 'true');
    }

    // Check if response is not JSON (when HTML is returned instead)
    const contentType = res.headers.get('content-type');
    if (contentType && !contentType.includes('application/json') && 
        method !== 'GET' && !res.ok) {
      // This likely means we got an HTML error page instead of JSON
      console.error(`Non-JSON response received from ${url}`, {
        status: res.status,
        contentType
      });
      
      // If this is a 401 Unauthorized, handle accordingly
      if (res.status === 401) {
        // Create an error object that matches our expected format
        const authError = new Error("Authentication required");
        throw Object.assign(authError, { status: 401, message: "Authentication required" });
      } else {
        // For other errors, create a helpful error message
        const error = new Error(`Server returned ${res.status}: Request failed`);
        throw Object.assign(error, { status: res.status, message: `Server error (${res.status})` });
      }
    }

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API Request failed for ${method} ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Extract the URL from the query key (first element is always the URL)
    const url = queryKey[0] as string;
    
    // Add timestamp to auth-related endpoints to prevent caching issues
    const finalUrl = url.includes("/api/user")
      ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`
      : url;
    
    // Track auth state for debugging and cache management
    const isAuthRequest = url.includes("/api/user");
    
    try {
      // Check for auth state transitions
      if (isAuthRequest) {
        // For user data fetches, check if we've just logged in/out to force fresh data
        const loginSuccess = sessionStorage.getItem('auth_login_success');
        const logoutRequested = sessionStorage.getItem('auth_logout_requested');

        if (loginSuccess) {
          console.log("[Analysis] Login success detected or no user, refreshing auth state");
          // Clear login flag after using it
          sessionStorage.removeItem('auth_login_success');
        }

        if (logoutRequested) {
          console.log("[Analysis] Logout detected, updating auth state");
          // Clear logout flag after using it
          sessionStorage.removeItem('auth_logout_requested');
          // Clear cache for next load
          queryClient.setQueryData(["/api/user"], null);
          // Return null immediately to update UI faster
          return null;
        }
      }

      const res = await fetch(finalUrl, {
        credentials: "include",
        // Add cache busting for auth-related endpoints to prevent browser caching
        headers: isAuthRequest ? {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } : {}
      });
  
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        if (isAuthRequest) {
          console.log("[Analysis] Auth refresh complete, user:", "Not found");
        }
        return null;
      }
  
      await throwIfResNotOk(res);
      
      const data = await res.json();
      
      // Track auth state for debugging
      if (isAuthRequest) {
        if (data && 'username' in data) {
          console.log("[Analysis] Checking auth status, current user:", `Logged in as ${data.username}`);
          console.log("[Analysis] Auth refresh complete, user:", "Found");
        } else {
          console.log("[Analysis] Checking auth status, current user:", "Not logged in");
        }
      }
      
      return data;
    } catch (error: any) {
      // For auth requests, we want to handle errors differently
      if (isAuthRequest) {
        // Log more descriptive error but don't expose sensitive data
        console.error(`[Auth] Error fetching user:`, {
          status: error.status,
          message: error.message,
          url: error.url
        });
        
        // Handle network errors and server errors differently
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.log("[Analysis] Network error during auth check, will retry later");
          // Return null to prevent app from crashing due to network issues
          return null;
        }
        
        // For 401s and 403s with returnNull behavior, we should return null
        if (unauthorizedBehavior === "returnNull" && 
            (error.status === 401 || error.status === 403 || error.status === 502)) {
          console.log("[Analysis] Auth refresh rejected with status code, clearing user data");
          return null;
        }
      }
      
      // Re-throw the error for the caller to handle
      throw error;
    }
  };

// Silent error handler for React Query - we handle errors in the components
// This prevents unhandled promise rejections in the console
const silentErrorHandler = () => {
  // Intentionally empty - errors are handled at component level
};

// Enhanced QueryClient configuration for better performance and caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Enable focus refetching to sync state across browser tabs
      refetchOnMount: 'always', // Always refetch when component mounts for consistency
      staleTime: 5000, // Keep data fresh for 5 seconds before refetching (reduced for auth state)
      retry: (failureCount, error: any) => {
        // Don't retry on 401 or 403 errors
        if (error.status === 401 || error.status === 403) {
          return false;
        }
        // Only retry other errors once
        return failureCount < 1;
      },
      retryDelay: 1000, // Wait 1 second before retry (reduced for faster response)
      gcTime: 1000 * 60 * 5, // Keep unused data in the cache for 5 minutes (reduced for auth state)
    },
    mutations: {
      retry: false, // No automatic retries for mutations (handled manually in auth system)
      onError: silentErrorHandler
    },
  },
});
