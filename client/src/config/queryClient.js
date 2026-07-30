import { QueryClient } from '@tanstack/react-query';

/**
 * Global TanStack Query Client instance.
 * Houses server-state caching policies and network retry criteria.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent jarring board shifts when refocusing
      retry: (failureCount, error) => {
        // Do not retry authorization or resource missing failures
        if (error?.status === 401 || error?.status === 404 || error?.status === 403) {
          return false;
        }
        return failureCount < 3; // Retry up to 3 times for temporary server errors
      },
      staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes before auto-refetching
      gcTime: 1000 * 60 * 15,    // Keep garbage collector cache for 15 minutes
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation failure intercepted:', error.message || error);
      },
    },
  },
});
