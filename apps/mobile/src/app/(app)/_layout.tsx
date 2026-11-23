import { useNotificationDeepLinks } from '@starter/features';

import AppTabs from '@/shell/app-tabs';

/** Signed-in area: native bottom tabs (Home, Settings). */
export default function AppLayout() {
  // Notification taps open their `data.url` screen — only once signed in, where those screens exist.
  useNotificationDeepLinks();
  return <AppTabs />;
}
