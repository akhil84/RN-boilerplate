import NetInfo from '@react-native-community/netinfo';
import { AppState, type AppStateStatus } from 'react-native';

import { setupAppListeners } from '@app/store/listeners';

describe('setupAppListeners', () => {
  let appStateHandler: (state: AppStateStatus) => void = () => {};
  let netInfoHandler: (state: { isConnected: boolean | null }) => void = () => {};
  const removeAppState = jest.fn();
  const removeNetInfo = jest.fn();

  beforeEach(() => {
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
      appStateHandler = handler as typeof appStateHandler;
      return { remove: removeAppState } as never;
    });
    jest.mocked(NetInfo.addEventListener).mockImplementation((handler) => {
      netInfoHandler = handler as unknown as typeof netInfoHandler;
      return removeNetInfo;
    });
  });

  it('treats returning to the foreground as focus', () => {
    const dispatch = jest.fn();
    setupAppListeners(dispatch);

    appStateHandler('background');
    appStateHandler('active');

    expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
      '__rtkq/unfocused',
      '__rtkq/focused',
    ]);
  });

  it('reports connectivity changes', () => {
    const dispatch = jest.fn();
    setupAppListeners(dispatch);

    netInfoHandler({ isConnected: false });
    netInfoHandler({ isConnected: true });

    expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
      '__rtkq/offline',
      '__rtkq/online',
    ]);
  });

  it('removes both listeners on unsubscribe', () => {
    const unsubscribe = setupAppListeners(jest.fn());

    unsubscribe();

    expect(removeAppState).toHaveBeenCalled();
    expect(removeNetInfo).toHaveBeenCalled();
  });
});
