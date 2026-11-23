import { usePathname } from 'expo-router';
import { useEffect } from 'react';

import { analytics } from '@starter/core/observability';

/** Report a screen view whenever the route changes. Call once in each app's root layout. */
export function useScreenTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) analytics.screen(pathname);
  }, [pathname]);
}
