import { useEffect, useState } from 'react';

export function usePageRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Check if page was just loaded (refresh or initial load)
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0];
      // Check if it's a reload
      if (navEntry.type === 'reload') {
        setIsRefreshing(true);
        // Hide after a short delay
        const timer = setTimeout(() => setIsRefreshing(false), 1000);
        return () => clearTimeout(timer);
      }
    }

    // Listen for beforeunload to show indicator
    const handleBeforeUnload = () => {
      setIsRefreshing(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return isRefreshing;
}

// Hook for manual refresh control
export function useManualRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startRefresh = () => setIsRefreshing(true);
  const stopRefresh = () => setIsRefreshing(false);

  return { isRefreshing, startRefresh, stopRefresh };
}
