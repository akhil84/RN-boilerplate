import { useAppSelector } from '@app/store/hooks';
import { selectSessionStatus } from '@features/auth/model/session-slice';

/** `unknown` until the stored session has been checked; route guards and the splash use this. */
export function useSessionStatus() {
  return useAppSelector(selectSessionStatus);
}
