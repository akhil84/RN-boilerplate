import { useWindowDimensions } from 'react-native';

/** Width breakpoints (dp / CSS px). `md` and up gets the wide web layout (sidebar). */
export const Breakpoints = { sm: 0, md: 768, lg: 1024 } as const;
export type Breakpoint = keyof typeof Breakpoints;

export function breakpointForWidth(width: number): Breakpoint {
  if (width >= Breakpoints.lg) return 'lg';
  if (width >= Breakpoints.md) return 'md';
  return 'sm';
}

/** Current breakpoint, updated on resize / rotation. */
export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  return breakpointForWidth(width);
}

/** True when the window is at least `breakpoint` wide. */
export function useMinWidth(breakpoint: Breakpoint): boolean {
  const { width } = useWindowDimensions();
  return width >= Breakpoints[breakpoint];
}
