import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
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

// Helper function to fetch static JSON data
export async function fetchStaticData<T>(filepath: string): Promise<T> {
  const res = await fetch(filepath);
  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let url: string;
    
    // Separate path segments from query parameter objects
    const pathSegments: (string | number)[] = [];
    const queryParams: Record<string, any> = {};
    
    for (const segment of queryKey) {
      if (typeof segment === 'object' && segment !== null) {
        // Merge object segments into query parameters
        Object.assign(queryParams, segment);
      } else if (typeof segment === 'string' || typeof segment === 'number') {
        // Add strings/numbers to path
        pathSegments.push(segment);
      }
    }
    
    // Build base URL from path segments
    const basePath = pathSegments.join("/");
    
    // Build query string from collected parameters
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    url = searchParams.toString() ? `${basePath}?${searchParams.toString()}` : basePath;
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
