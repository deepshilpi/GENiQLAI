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
      console.error("Error parsing error response:", e);
      errorText = await res.text() || res.statusText;
    }
    throw new Error(errorText);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Enhanced QueryClient configuration for better performance and caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Enable selective refetching on window focus for fresh data
      staleTime: 5 * 60 * 1000, // 5 minutes stale time instead of Infinity for balance between caching and freshness
      retry: 1, // Allow one retry for better resilience and user experience
      retryDelay: 1000 // Wait 1 second before retry
      // Note: TanStack Query v5 doesn't use keepPreviousData or placeholderData in defaultOptions
    },
    mutations: {
      retry: 1, // Allow one retry for better resilience
      retryDelay: 1000 // Wait 1 second before retry
    },
  },
});
